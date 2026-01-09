#!/usr/bin/env python3
"""
🔒 SECURITY AUDITOR - Next.js/SaaS Applications
Análise automática de vulnerabilidades em aplicações Next.js com Prisma

Autor: Claude (Anthropic)
Versão: 1.0
Data: 2026-01-06
"""

import os
import re
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Set
from dataclasses import dataclass, field
from collections import defaultdict
import hashlib

# ============================================================================
# CONFIGURAÇÕES E CONSTANTES
# ============================================================================

@dataclass
class Vulnerability:
    """Representa uma vulnerabilidade encontrada"""
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str
    file_path: str
    line_number: int
    code_snippet: str
    description: str
    recommendation: str
    cwe_id: str = ""
    
@dataclass
class SecurityReport:
    """Relatório completo de segurança"""
    vulnerabilities: List[Vulnerability] = field(default_factory=list)
    statistics: Dict = field(default_factory=dict)
    file_count: int = 0
    line_count: int = 0
    
    def add_vuln(self, vuln: Vulnerability):
        self.vulnerabilities.append(vuln)
    
    def get_by_severity(self, severity: str) -> List[Vulnerability]:
        return [v for v in self.vulnerabilities if v.severity == severity]
    
    def get_score(self) -> int:
        """Calcula score de segurança (0-100, sendo 100 = perfeito)"""
        critical = len(self.get_by_severity("CRITICAL"))
        high = len(self.get_by_severity("HIGH"))
        medium = len(self.get_by_severity("MEDIUM"))
        low = len(self.get_by_severity("LOW"))
        
        # Penalidades por vulnerabilidade
        score = 100
        score -= critical * 25  # Cada crítica = -25 pontos
        score -= high * 10      # Cada alta = -10 pontos
        score -= medium * 5     # Cada média = -5 pontos
        score -= low * 2        # Cada baixa = -2 pontos
        
        return max(0, score)

# ============================================================================
# PADRÕES DE VULNERABILIDADES
# ============================================================================

class VulnerabilityPatterns:
    """Padrões de código vulnerável para detectar"""
    
    # Autenticação e Autorização
    AUTH_PATTERNS = {
        'fake_token': (
            r'token:\s*[\'"`]bearer-\$\{.*?\}[\'"`]',
            "CRITICAL",
            "Token de autenticação falso usando apenas ID do usuário",
            "Implemente JWT real com jsonwebtoken ou jose",
            "CWE-287"
        ),
        'bypass_login': (
            r'document\.cookie\s*=\s*[\'"]admin-logged=true',
            "CRITICAL",
            "Bypass de autenticação via cookie setado no cliente",
            "Remova esse código e implemente autenticação server-side",
            "CWE-798"
        ),
        'no_auth_check': (
            r'export\s+default\s+function.*?\{(?:(?!useSession|getServerSession|auth|middleware).)*\}',
            "HIGH",
            "Componente/página sem verificação de autenticação",
            "Adicione verificação de sessão ou proteja com middleware",
            "CWE-306"
        ),
        'weak_password': (
            r'password.*?\.length\s*[<>=]+\s*[0-5]',
            "MEDIUM",
            "Validação de senha fraca (menos de 6 caracteres)",
            "Exija senhas com pelo menos 8 caracteres",
            "CWE-521"
        ),
    }
    
    # Banco de Dados
    DATABASE_PATTERNS = {
        'sql_injection': (
            r'`SELECT.*?\$\{.*?\}`|prisma\.\$executeRaw\(`.*?\$\{',
            "CRITICAL",
            "Potencial SQL Injection com interpolação de strings",
            "Use prepared statements ou Prisma queries parametrizadas",
            "CWE-89"
        ),
        'prisma_per_request': (
            r'const\s+prisma\s*=\s*new\s+PrismaClient\(\)',
            "HIGH",
            "Nova instância do Prisma por requisição (esgota conexões)",
            "Use singleton pattern para PrismaClient",
            "CWE-404"
        ),
        'exposed_credentials': (
            r'(postgres://|mysql://|mongodb://)[\w]+:[\w]+@',
            "CRITICAL",
            "Credenciais de banco expostas no código",
            "Mova para variáveis de ambiente e rotacione as credenciais",
            "CWE-798"
        ),
    }
    
    # Dados Sensíveis
    SENSITIVE_DATA_PATTERNS = {
        'cpf_plain_text': (
            r'cpf\s*String(?!\s*@db\.Text)',
            "CRITICAL",
            "CPF armazenado sem criptografia (violação LGPD)",
            "Implemente criptografia AES-256 para CPF",
            "CWE-311"
        ),
        'password_plain': (
            r'senha\s*String(?!.*bcrypt|.*hash)',
            "CRITICAL",
            "Senha possivelmente sem hash adequado",
            "Use bcrypt ou argon2 para hash de senhas",
            "CWE-916"
        ),
        'email_no_validation': (
            r'email\s*String(?!.*@)',
            "MEDIUM",
            "Email sem validação de formato",
            "Adicione validação com regex ou biblioteca",
            "CWE-20"
        ),
    }
    
    # API e Rotas
    API_PATTERNS = {
        'no_rate_limit': (
            r'export\s+async\s+function\s+(POST|PUT|PATCH|DELETE).*?\{(?:(?!rateLimit|upstash|redis).){0,500}\}',
            "HIGH",
            "Endpoint sem rate limiting",
            "Implemente rate limiting com Upstash Redis ou similar",
            "CWE-770"
        ),
        'no_cors': (
            r'export\s+async\s+function.*?\{(?:(?!cors|origin).){0,500}\}',
            "MEDIUM",
            "API sem configuração CORS",
            "Configure CORS adequadamente",
            "CWE-942"
        ),
        'no_input_validation': (
            r'await\s+req\.json\(\).*?(?!zod|yup|joi)',
            "HIGH",
            "Dados de entrada sem validação",
            "Use Zod, Yup ou Joi para validar inputs",
            "CWE-20"
        ),
        'dynamic_force_open': (
            r"export\s+const\s+dynamic\s*=\s*['\"]force-dynamic['\"]",
            "MEDIUM",
            "Rota forçada como dinâmica (pode impactar performance)",
            "Revise se realmente precisa ser dinâmica",
            "CWE-400"
        ),
    }
    
    # Middleware e Proteção
    MIDDLEWARE_PATTERNS = {
        'open_middleware': (
            r'export\s+function\s+middleware.*?return\s+NextResponse\.next\(\)\s*;?\s*\}',
            "CRITICAL",
            "Middleware completamente aberto (sem proteção)",
            "Implemente verificação de autenticação no middleware",
            "CWE-306"
        ),
        'no_csrf': (
            r'export\s+async\s+function\s+POST(?:(?!csrf|token).){0,500}\}',
            "HIGH",
            "POST sem proteção CSRF",
            "Implemente tokens CSRF",
            "CWE-352"
        ),
    }
    
    # Secrets e Configurações
    SECRETS_PATTERNS = {
        'hardcoded_secret': (
            r'(secret|password|key|token)\s*[:=]\s*[\'"][^\'"]{8,}[\'"]',
            "CRITICAL",
            "Secret/senha hardcoded no código",
            "Mova para variáveis de ambiente",
            "CWE-798"
        ),
        'weak_jwt_secret': (
            r'jwt.*?secret.*?[\'"][a-zA-Z0-9]{1,15}[\'"]',
            "HIGH",
            "JWT secret fraco (menos de 16 caracteres)",
            "Use secret com pelo menos 32 caracteres aleatórios",
            "CWE-326"
        ),
        'env_in_code': (
            r'DATABASE_URL\s*=\s*[\'"]postgresql://',
            "CRITICAL",
            "Variável de ambiente com valor no código",
            "Remova o valor e use apenas env vars",
            "CWE-540"
        ),
    }
    
    # XSS e Injeções
    XSS_PATTERNS = {
        'dangerouslySetInnerHTML': (
            r'dangerouslySetInnerHTML\s*=',
            "HIGH",
            "Uso de dangerouslySetInnerHTML (risco XSS)",
            "Sanitize HTML com DOMPurify antes de usar",
            "CWE-79"
        ),
        'eval_usage': (
            r'\beval\s*\(',
            "CRITICAL",
            "Uso de eval() (execução de código arbitrário)",
            "Remova eval() e use alternativas seguras",
            "CWE-95"
        ),
    }

# ============================================================================
# SCANNER DE ARQUIVOS
# ============================================================================

class SecurityScanner:
    """Scanner principal de segurança"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.report = SecurityReport()
        self.patterns = VulnerabilityPatterns()
        self.scanned_files: Set[str] = set()
        
    def scan(self) -> SecurityReport:
        """Executa scan completo do projeto"""
        print("🔍 Iniciando auditoria de segurança...\n")
        
        # 1. Scan de arquivos TypeScript/JavaScript
        self._scan_source_files()
        
        # 2. Scan do schema Prisma
        self._scan_prisma_schema()
        
        # 3. Scan de configurações
        self._scan_config_files()
        
        # 4. Scan de .env files
        self._scan_env_files()
        
        # 5. Gera estatísticas
        self._generate_statistics()
        
        return self.report
    
    def _scan_source_files(self):
        """Scan de arquivos .ts, .tsx, .js, .jsx"""
        print("📂 Escaneando código-fonte...")
        
        extensions = ['.ts', '.tsx', '.js', '.jsx']
        exclude_dirs = {'node_modules', '.next', 'dist', 'build', '.git'}
        
        for ext in extensions:
            for file_path in self.project_path.rglob(f'*{ext}'):
                # Pula diretórios excluídos
                if any(excluded in file_path.parts for excluded in exclude_dirs):
                    continue
                
                self._scan_file(file_path)
        
        print(f"✅ {len(self.scanned_files)} arquivos escaneados\n")
    
    def _scan_file(self, file_path: Path):
        """Escaneia um arquivo específico"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
                
            self.scanned_files.add(str(file_path))
            self.report.file_count += 1
            self.report.line_count += len(lines)
            
            # Aplica todos os padrões
            self._apply_patterns(file_path, content, lines)
            
        except Exception as e:
            print(f"⚠️  Erro ao ler {file_path}: {e}")
    
    def _apply_patterns(self, file_path: Path, content: str, lines: List[str]):
        """Aplica todos os padrões de vulnerabilidade"""
        all_patterns = {
            **self.patterns.AUTH_PATTERNS,
            **self.patterns.DATABASE_PATTERNS,
            **self.patterns.SENSITIVE_DATA_PATTERNS,
            **self.patterns.API_PATTERNS,
            **self.patterns.MIDDLEWARE_PATTERNS,
            **self.patterns.SECRETS_PATTERNS,
            **self.patterns.XSS_PATTERNS,
        }
        
        for pattern_name, (regex, severity, desc, rec, cwe) in all_patterns.items():
            matches = re.finditer(regex, content, re.MULTILINE | re.DOTALL)
            
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                
                # Extrai snippet de código (3 linhas de contexto)
                start_line = max(0, line_num - 2)
                end_line = min(len(lines), line_num + 2)
                snippet = '\n'.join(lines[start_line:end_line])
                
                vuln = Vulnerability(
                    severity=severity,
                    category=pattern_name,
                    file_path=str(file_path.relative_to(self.project_path)),
                    line_number=line_num,
                    code_snippet=snippet,
                    description=desc,
                    recommendation=rec,
                    cwe_id=cwe
                )
                
                self.report.add_vuln(vuln)
    
    def _scan_prisma_schema(self):
        """Scan específico do schema.prisma"""
        print("🗄️  Escaneando Prisma Schema...")
        
        schema_path = self.project_path / "prisma" / "schema.prisma"
        if not schema_path.exists():
            print("⚠️  Schema Prisma não encontrado\n")
            return
        
        with open(schema_path, 'r') as f:
            content = f.read()
            lines = content.split('\n')
        
        # Verifica campos sensíveis sem criptografia
        sensitive_fields = ['cpf', 'rg', 'senha', 'password', 'ssn']
        
        for i, line in enumerate(lines, 1):
            for field in sensitive_fields:
                if re.search(rf'\b{field}\s+String\b', line):
                    # Verifica se NÃO tem indicação de criptografia
                    if '@db.Text' not in line and 'hash' not in line.lower():
                        vuln = Vulnerability(
                            severity="CRITICAL",
                            category="unencrypted_pii",
                            file_path="prisma/schema.prisma",
                            line_number=i,
                            code_snippet=line.strip(),
                            description=f"Campo '{field}' sem criptografia (violação LGPD)",
                            recommendation="Implemente criptografia AES-256 ou use @db.Text com hash",
                            cwe_id="CWE-311"
                        )
                        self.report.add_vuln(vuln)
        
        print("✅ Schema Prisma escaneado\n")
    
    def _scan_config_files(self):
        """Scan de arquivos de configuração"""
        print("⚙️  Escaneando configurações...")
        
        config_files = [
            'next.config.js',
            'next.config.ts',
            'package.json',
            'tsconfig.json'
        ]
        
        for config_file in config_files:
            config_path = self.project_path / config_file
            if config_path.exists():
                self._scan_file(config_path)
        
        print("✅ Configurações escaneadas\n")
    
    def _scan_env_files(self):
        """Scan de arquivos .env"""
        print("🔐 Escaneando arquivos .env...")
        
        env_files = list(self.project_path.glob('.env*'))
        
        for env_file in env_files:
            # NUNCA deve ter .env commitado
            if env_file.name == '.env':
                vuln = Vulnerability(
                    severity="CRITICAL",
                    category="env_committed",
                    file_path=str(env_file.relative_to(self.project_path)),
                    line_number=1,
                    code_snippet="Arquivo .env encontrado no projeto",
                    description="Arquivo .env não deve ser commitado (contém secrets)",
                    recommendation="Adicione .env ao .gitignore e rotacione todos os secrets",
                    cwe_id="CWE-540"
                )
                self.report.add_vuln(vuln)
            
            # Verifica conteúdo
            try:
                with open(env_file, 'r') as f:
                    lines = f.readlines()
                
                for i, line in enumerate(lines, 1):
                    # Procura por credenciais expostas
                    if re.search(r'(DATABASE_URL|API_KEY|SECRET).*?=.*?[^\s]', line):
                        if 'localhost' not in line and 'example' not in line.lower():
                            vuln = Vulnerability(
                                severity="HIGH",
                                category="exposed_env_var",
                                file_path=str(env_file.relative_to(self.project_path)),
                                line_number=i,
                                code_snippet=line.strip()[:50] + "...",
                                description="Possível credencial real em arquivo .env",
                                recommendation="Verifique se este arquivo não foi commitado e rotacione credenciais",
                                cwe_id="CWE-798"
                            )
                            self.report.add_vuln(vuln)
            except Exception as e:
                print(f"⚠️  Erro ao ler {env_file}: {e}")
        
        print("✅ Arquivos .env escaneados\n")
    
    def _generate_statistics(self):
        """Gera estatísticas do scan"""
        self.report.statistics = {
            'total_vulnerabilities': len(self.report.vulnerabilities),
            'critical': len(self.report.get_by_severity('CRITICAL')),
            'high': len(self.report.get_by_severity('HIGH')),
            'medium': len(self.report.get_by_severity('MEDIUM')),
            'low': len(self.report.get_by_severity('LOW')),
            'files_scanned': self.report.file_count,
            'lines_scanned': self.report.line_count,
            'security_score': self.report.get_score()
        }

# ============================================================================
# GERADOR DE RELATÓRIOS
# ============================================================================

class ReportGenerator:
    """Gera relatórios formatados"""
    
    @staticmethod
    def generate_console_report(report: SecurityReport):
        """Gera relatório para console"""
        print("\n" + "="*80)
        print("🔒 RELATÓRIO DE AUDITORIA DE SEGURANÇA")
        print("="*80 + "\n")
        
        # Estatísticas
        stats = report.statistics
        score = stats['security_score']
        
        # Define cor do score
        if score >= 80:
            score_emoji = "🟢"
            score_text = "BOM"
        elif score >= 50:
            score_emoji = "🟡"
            score_text = "REGULAR"
        else:
            score_emoji = "🔴"
            score_text = "CRÍTICO"
        
        print(f"📊 ESTATÍSTICAS GERAIS:")
        print(f"   Arquivos escaneados: {stats['files_scanned']}")
        print(f"   Linhas de código: {stats['lines_scanned']:,}")
        print(f"   Score de Segurança: {score_emoji} {score}/100 ({score_text})")
        print()
        
        print(f"🚨 VULNERABILIDADES ENCONTRADAS: {stats['total_vulnerabilities']}")
        print(f"   🔴 CRÍTICAS: {stats['critical']}")
        print(f"   🟠 ALTAS: {stats['high']}")
        print(f"   🟡 MÉDIAS: {stats['medium']}")
        print(f"   🟢 BAIXAS: {stats['low']}")
        print()
        
        # Lista vulnerabilidades por severidade
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            vulns = report.get_by_severity(severity)
            if not vulns:
                continue
            
            emoji = {
                'CRITICAL': '🔴',
                'HIGH': '🟠',
                'MEDIUM': '🟡',
                'LOW': '🟢'
            }[severity]
            
            print(f"\n{emoji} {'='*70}")
            print(f"{emoji} VULNERABILIDADES {severity}")
            print(f"{emoji} {'='*70}\n")
            
            for i, vuln in enumerate(vulns, 1):
                print(f"[{i}] {vuln.category}")
                print(f"    📂 Arquivo: {vuln.file_path}")
                print(f"    📍 Linha: {vuln.line_number}")
                print(f"    📝 Descrição: {vuln.description}")
                print(f"    ✅ Recomendação: {vuln.recommendation}")
                if vuln.cwe_id:
                    print(f"    🔗 CWE: {vuln.cwe_id}")
                print(f"\n    Código:")
                for line in vuln.code_snippet.split('\n'):
                    print(f"       {line}")
                print()
        
        print("="*80)
        print("🎯 PRÓXIMOS PASSOS:")
        print("="*80)
        print("1. Corrija TODAS as vulnerabilidades CRÍTICAS IMEDIATAMENTE")
        print("2. Implemente as recomendações para vulnerabilidades ALTAS")
        print("3. Revise e corrija vulnerabilidades MÉDIAS")
        print("4. Planeje correção das vulnerabilidades BAIXAS")
        print("5. Execute este scan regularmente (CI/CD)")
        print("="*80 + "\n")
    
    @staticmethod
    def generate_json_report(report: SecurityReport, output_file: str):
        """Gera relatório em JSON"""
        data = {
            'statistics': report.statistics,
            'vulnerabilities': [
                {
                    'severity': v.severity,
                    'category': v.category,
                    'file': v.file_path,
                    'line': v.line_number,
                    'description': v.description,
                    'recommendation': v.recommendation,
                    'cwe_id': v.cwe_id,
                    'code_snippet': v.code_snippet
                }
                for v in report.vulnerabilities
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Relatório JSON salvo em: {output_file}")
    
    @staticmethod
    def generate_markdown_report(report: SecurityReport, output_file: str):
        """Gera relatório em Markdown"""
        stats = report.statistics
        score = stats['security_score']
        
        md = f"""# 🔒 Relatório de Auditoria de Segurança

**Data:** {__import__('datetime').datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Arquivos Escaneados | {stats['files_scanned']} |
| Linhas de Código | {stats['lines_scanned']:,} |
| **Score de Segurança** | **{score}/100** |
| Total de Vulnerabilidades | {stats['total_vulnerabilities']} |

## 🚨 Vulnerabilidades por Severidade

| Severidade | Quantidade |
|------------|------------|
| 🔴 CRÍTICA | {stats['critical']} |
| 🟠 ALTA | {stats['high']} |
| 🟡 MÉDIA | {stats['medium']} |
| 🟢 BAIXA | {stats['low']} |

"""
        
        # Adiciona cada vulnerabilidade
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            vulns = report.get_by_severity(severity)
            if not vulns:
                continue
            
            emoji = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🟢'}[severity]
            md += f"\n## {emoji} Vulnerabilidades {severity}\n\n"
            
            for i, vuln in enumerate(vulns, 1):
                md += f"""### {i}. {vuln.category}

**Arquivo:** `{vuln.file_path}`  
**Linha:** {vuln.line_number}  
**CWE:** {vuln.cwe_id}

**Descrição:** {vuln.description}

**Recomendação:** {vuln.recommendation}

**Código:**
```
{vuln.code_snippet}
```

---

"""
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(md)
        
        print(f"📄 Relatório Markdown salvo em: {output_file}")

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Função principal"""
    if len(sys.argv) < 2:
        print("❌ Uso: python security_auditor.py <caminho_do_projeto>")
        print("\nExemplo:")
        print("  python security_auditor.py /home/user/meu-saas")
        print("  python security_auditor.py .")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    if not os.path.isdir(project_path):
        print(f"❌ Erro: '{project_path}' não é um diretório válido")
        sys.exit(1)
    
    print(f"""
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🔒 SECURITY AUDITOR - Next.js/SaaS Applications       ║
║                                                               ║
║  Análise automática de vulnerabilidades                      ║
║  Versão: 1.0                                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🎯 Projeto: {project_path}
""")
    
    # Executa scan
    scanner = SecurityScanner(project_path)
    report = scanner.scan()
    
    # Gera relatórios
    print("\n📝 Gerando relatórios...\n")
    
    ReportGenerator.generate_console_report(report)
    
    output_dir = Path(project_path) / "security_reports"
    output_dir.mkdir(exist_ok=True)
    
    timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
    
    ReportGenerator.generate_json_report(
        report, 
        str(output_dir / f"security_report_{timestamp}.json")
    )
    
    ReportGenerator.generate_markdown_report(
        report,
        str(output_dir / f"security_report_{timestamp}.md")
    )
    
    print(f"\n✅ Auditoria concluída!")
    print(f"📁 Relatórios salvos em: {output_dir}\n")
    
    # Exit code baseado no score
    score = report.statistics['security_score']
    if score < 50:
        sys.exit(1)  # Falha se score muito baixo
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
