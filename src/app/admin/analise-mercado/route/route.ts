import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuração STR Genetics usando variáveis de ambiente
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'imobiliaria_str',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export async function GET() {
  try {
    // Query corrigida com o nome correto da tabela: analises_mercado
    const result = await pool.query(`
      SELECT 
        id, 
        cidade, 
        estado, 
        "valorM2", 
        "valorMinimo", 
        "valorMaximo", 
        tendencia, 
        fonte, 
        observacoes, 
        "dataAnalise" 
      FROM analises_mercado 
      ORDER BY "dataAnalise" DESC
    `);

    return NextResponse.json({ 
      data: result.rows,
      status: 'success'
    }, { status: 200 });

  } catch (error: any) {
    console.error('[STR GENETICS DB ERROR]:', error);
    
    return NextResponse.json(
      { 
        data: [], 
        error: 'Falha na extração PostgreSQL. Verifique se a tabela "analises_mercado" existe.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
