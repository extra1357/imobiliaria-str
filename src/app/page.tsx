'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Estilos Swiper Completos
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Imovel {
  id: string;
  type: string;
  title: string;
  addr: string;
  price: number;
  imagens: string[];
  description: string;
  features: string[];
  quartos?: number;
  banheiros?: number;
  garagem?: number;
}

interface Agent {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [leadForm, setLeadForm] = useState({
    name: '', email: '', phone: '', property: '', datetime: '', message: '', budget: ''
  });
  const [leadResult, setLeadResult] = useState<string | null>(null);
  const [agentPrompt, setAgentPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const agents: Agent[] = [
    { id: 'AG001', name: 'João Silva', phone: '+5511999000001', role: 'Especialista Residencial' },
    { id: 'AG002', name: 'Mariana Alves', phone: '+5511999000002', role: 'Gestora de Lançamentos' }
  ];

  useEffect(() => {
    async function loadDataFromPostgres() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/imoveis', { next: { revalidate: 180 } });
        const data = await res.json();
        
        const mapped = data.map((p: any) => ({
          id: String(p.id || ''),
          type: String(p.tipo || 'casa'),
          title: String(p.titulo || 'Imóvel sem título'),
          addr: String(p.endereco || 'Consulte localização'),
          price: Number(p.preco || 0),
          imagens: Array.isArray(p.imagens) ? p.imagens : JSON.parse(p.imagens || '[]'),
          description: String(p.descricao || ''),
          features: Array.isArray(p.caracteristicas) ? p.caracteristicas : [],
          quartos: Number(p.quartos || 0),
          banheiros: Number(p.banheiros || 0),
          garagem: Number(p.garagem || 0)
        }));
        
        setProperties(mapped);
      } catch (err: any) {
        console.error("Critical Error [STR Genetics]:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDataFromPostgres();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title ? p.title.toLowerCase().includes(q) : false;
      const addrMatch = p.addr ? p.addr.toLowerCase().includes(q) : false;
      const idMatch = p.id ? p.id.toLowerCase().includes(q) : false;

      const matchSearch = titleMatch || addrMatch || idMatch;
      const matchType = filterType === 'all' || p.type === filterType;
      const matchPrice = !maxPrice || p.price <= parseFloat(maxPrice.replace(/\D/g, ''));
      
      return matchSearch && matchType && matchPrice;
    });
  }, [searchQuery, filterType, maxPrice, properties]);

  const handleSendLead = async () => {
    if(!leadForm.name || !leadForm.phone || !leadForm.email){
      alert('Validação Falhou: Nome, E-mail e Telefone são obrigatórios no padrão STR.');
      return;
    }

    try {
      setIsSending(true);
      const leadId = 'STR-GEN-' + Date.now().toString(36).toUpperCase();

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          nome: leadForm.name,
          email: leadForm.email,
          telefone: leadForm.phone,
          imovel: leadForm.property,
          data_contato: leadForm.datetime,
          mensagem: leadForm.message
        }),
      });

      if (!response.ok) throw new Error('Falha ao persistir lead no banco.');

      const assigned = agents[Math.floor(Math.random() * agents.length)];
      setLeadResult(`PROTOCOLO: ${leadId}\nStatus: Salvo no Banco e Encaminhado para ${assigned.name}`);
      
      const prompt = `[NOVO LEAD PERSISTIDO - STR GENETICS]\n\nID: ${leadId}\nCLIENTE: ${leadForm.name}\nCONTATO: ${leadForm.phone}\nE-MAIL: ${leadForm.email}\nINTERESSE: ${leadForm.property}\nDATA: ${leadForm.datetime || 'Imediato'}\nMENSAGEM: ${leadForm.message}`;
      setAgentPrompt(prompt);

    } catch (err: any) {
      console.error("Erro ao processar lead:", err);
      alert('Erro ao salvar lead. Verifique a conexão com o banco de dados.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --bg:#f0f4f8; --card:#ffffff; --accent:#1e40af; --accent-light:#3b82f6; --text:#0f172a; --muted:#64748b; --max-width:1200px; }
        * { box-sizing: border-box; }
        body { margin:0; background:var(--bg); color:var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        header { background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%); color:white; padding:35px 20px; position:sticky; top:0; z-index:1000; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .wrap { max-width:var(--max-width); margin:0 auto; display:flex; justify-content:space-between; align-items:center; }
        .logo-area h1 { margin:0; font-size:26px; font-weight:900; letter-spacing:-1px; text-transform: uppercase; }
        .logo-area p { margin:5px 0 0; font-size:14px; opacity:0.8; font-weight:500; }
        .admin-btn { background:rgba(255,255,255,0.1); color:white; padding:12px 28px; border-radius:12px; border:1px solid rgba(255,255,255,0.3); font-weight:800; cursor:pointer; font-size:14px; transition:0.3s; backdrop-filter: blur(10px); }
        .admin-btn:hover { background:white; color:var(--accent); transform: translateY(-3px); }
        main { padding:40px 20px; max-width:var(--max-width); margin:0 auto; }
        .filter-bar { background:white; padding:25px; border-radius:20px; box-shadow:0 4px 20px rgba(0,0,0,0.05); display:flex; gap:20px; margin-bottom:40px; align-items:flex-end; border:1px solid #e2e8f0; flex-wrap: wrap; }
        .input-group { display:flex; flex-direction:column; gap:8px; flex:1; min-width: 200px; }
        .input-group label { font-size:12px; font-weight:800; color:var(--muted); text-transform: uppercase; }
        input, select, textarea { padding:14px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:15px; background:#f8fafc; width:100%; transition: all 0.3s; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent-light); background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        
        /* ========== OTIMIZAÇÃO 1: GRID COM CARDS NIVELADOS ========== */
        .grid { 
          display:grid; 
          grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); 
          gap:35px; 
        }
        
        /* ALTURA FIXA PARA NIVELAR OS CARDS */
        .card { 
          background:white; 
          border-radius:24px; 
          overflow:hidden; 
          box-shadow:0 15px 35px rgba(0,0,0,0.06); 
          border:1px solid #f1f5f9; 
          transition:0.3s ease-out; 
          display:flex; 
          flex-direction:column;
          height: 600px; /* ← ALTURA FIXA PARA NIVELAR */
        }
        .card:hover { transform: translateY(-10px); box-shadow:0 25px 50px rgba(0,0,0,0.12); }
        
        /* ========== OTIMIZAÇÃO 2: SETAS SÓ NO HOVER ========== */
        .card-swiper { 
          width:100%; 
          height:280px; 
          position: relative;
          flex-shrink: 0; /* Não encolhe */
        }
        .card-swiper img { 
          width:100%; 
          height:100%; 
          object-fit:cover; 
          cursor:pointer; 
          transition: transform 0.3s; 
        }
        .card-swiper img:hover { transform: scale(1.05); }
        
        /* SETAS OCULTAS POR PADRÃO */
        .card-swiper .swiper-button-next,
        .card-swiper .swiper-button-prev {
          opacity: 0;
          transition: opacity 0.3s ease;
          background: rgba(255,255,255,0.95);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        /* SETAS APARECEM NO HOVER DO CARD */
        .card:hover .swiper-button-next,
        .card:hover .swiper-button-prev {
          opacity: 1;
        }
        
        .card-swiper .swiper-button-next:after,
        .card-swiper .swiper-button-prev:after {
          font-size: 18px;
          font-weight: 900;
          color: var(--accent);
        }
        
        .card-swiper .swiper-button-next:hover,
        .card-swiper .swiper-button-prev:hover {
          background: var(--accent);
        }
        
        .card-swiper .swiper-button-next:hover:after,
        .card-swiper .swiper-button-prev:hover:after {
          color: white;
        }
        
        /* PAGINAÇÃO */
        .card-swiper .swiper-pagination {
          bottom: 12px;
        }
        .card-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.7;
          width: 8px;
          height: 8px;
        }
        .card-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: var(--accent);
          width: 24px;
          border-radius: 4px;
        }
        
        .card-body { 
          padding:28px; 
          flex:1; 
          display:flex; 
          flex-direction:column; 
          overflow: hidden;
        }
        
        .price { 
          font-size:28px; 
          font-weight:900; 
          color:var(--accent); 
          margin-bottom:12px; 
        }
        
        /* ENDEREÇO COM TRUNCATE PARA NÃO QUEBRAR LAYOUT */
        .addr { 
          font-size:15px; 
          color:var(--muted); 
          margin-bottom:20px; 
          min-height:48px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .addr strong {
          display: block;
          color: var(--text);
          font-weight: 800;
          margin-bottom: 5px;
        }
        
        /* ========== OTIMIZAÇÃO 3: ÍCONES DE CARACTERÍSTICAS ========== */
        .features-icons {
          display: flex;
          gap: 18px;
          margin: 12px 0;
          padding: 15px 0;
          border-top: 2px solid #f1f5f9;
          border-bottom: 2px solid #f1f5f9;
          flex-shrink: 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }
        .feature-item span {
          font-size: 20px;
        }
        
        /* DESCRIÇÃO COM TRUNCATE (SEM SCROLL) */
        .description-box { 
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 15px;
          border-left: 3px solid #e2e8f0;
          padding-left: 12px;
          flex-shrink: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .btn-interest { 
          background:var(--accent); 
          color:white; 
          width:100%; 
          padding:18px; 
          border:none; 
          border-radius:14px; 
          font-weight:800; 
          cursor:pointer; 
          transition:0.3s; 
          text-transform:uppercase;
          margin-top: auto; /* Empurra para o final */
          flex-shrink: 0;
        }
        .btn-interest:hover {
          background: var(--accent-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
        }
        .btn-interest:disabled { background:#cbd5e1; cursor:not-allowed; }
        
        /* DRAWER */
        .drawer-overlay { 
          position:fixed; 
          inset:0; 
          background:rgba(15,23,42,0.7); 
          z-index:1999; 
          display: ${isDrawerOpen ? 'block' : 'none'}; 
          backdrop-filter: blur(6px); 
        }
        .drawer { 
          position:fixed; 
          right:0; 
          top:0; 
          height:100%; 
          width:480px; 
          max-width:100%; 
          background:white; 
          z-index:2000; 
          padding:40px; 
          display: ${isDrawerOpen ? 'flex' : 'none'}; 
          flex-direction:column; 
          box-shadow:-20px 0 60px rgba(0,0,0,0.3); 
          overflow: hidden;
        }
        .field { 
          margin-bottom:20px; 
          display:flex; 
          flex-direction:column; 
          gap:8px; 
        }
        .field label { 
          font-size:13px; 
          font-weight:800; 
          color:var(--text); 
          text-transform:uppercase; 
        }
        .prompt-box { 
          background:#0f172a; 
          color:#cbd5e1; 
          padding:20px; 
          border-radius:15px; 
          font-size:13px; 
          margin-top:20px; 
          white-space:pre-wrap; 
        }
        .float-btn { 
          position:fixed; 
          right:40px; 
          bottom:40px; 
          background:var(--accent); 
          color:white; 
          width:70px; 
          height:70px; 
          border-radius:50%; 
          border:none; 
          cursor:pointer; 
          z-index:1500; 
          font-size:24px; 
          box-shadow:0 15px 35px rgba(30,64,175,0.4); 
          transition: 0.3s;
        }
        .float-btn:hover {
          transform: scale(1.1);
          box-shadow:0 20px 40px rgba(30,64,175,0.5);
        }
        
        /* RESPONSIVO */
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr; }
          .filter-bar { flex-direction: column; }
          .input-group { min-width: 100%; }
          .drawer { width: 100%; }
          .card { height: auto; min-height: 550px; }
        }
      ` }} />

      <header>
        <div className="wrap">
          <div className="logo-area">
            <h1>Imobiliária Perto STR</h1>
            <p>SISTEMA DE GESTÃO IMOBILIÁRIA PROFISSIONAL • STR GENETICS</p>
          </div>
          <button className="admin-btn" onClick={() => router.push('/admin/login')}>
            📊 ACESSAR PAINEL ADMINISTRATIVO
          </button>
        </div>
      </header>

      <main>
        <div className="filter-bar">
          <div className="input-group">
            <label>Busca Inteligente</label>
            <input type="search" placeholder="Endereço, Bairro, ID ou Título..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="input-group" style={{maxWidth:'200px'}}>
            <label>Categoria</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Todos os Imóveis</option>
              <option value="casa">Casas de Luxo</option>
              <option value="apto">Apartamentos</option>
              <option value="terreno">Terrenos</option>
            </select>
          </div>
          <div className="input-group" style={{maxWidth:'180px'}}>
            <label>Preço Máximo</label>
            <input type="text" placeholder="Ex: 1.000.000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div style={{textAlign:'center', padding:'100px', fontSize: '18px', color: '#64748b'}}>
            <div style={{fontSize: '48px', marginBottom: '20px'}}>⏳</div>
            Carregando dados do Postgres STR...
          </div>
        ) : (
          <section className="grid">
            {filteredProperties.map(p => (
              <article key={p.id} className="card">
                <Swiper 
                  navigation={true} 
                  pagination={{clickable:true}} 
                  modules={[Navigation, Pagination]} 
                  className="card-swiper"
                >
                  {p.imagens.length > 0 ? p.imagens.map((img: any, i: number) => (
                    <SwiperSlide key={i}>
                      <img 
                        src={img} 
                        alt={p.title}
                        onClick={() => router.push(`/imoveis/${p.id}`)}
                      />
                    </SwiperSlide>
                  )) : (
                    <SwiperSlide>
                      <div style={{background:'#f1f5f9', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color: '#94a3b8', fontSize: '16px'}}>
                        📷 Sem imagem
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
                
                <div className="card-body">
                  <div style={{background:'#eef2ff', color:'var(--accent)', padding:'6px 14px', borderRadius:'50px', fontSize:'11px', fontWeight:800, textTransform:'uppercase', marginBottom:'15px', width:'fit-content'}}>
                    {p.type}
                  </div>
                  <div className="price">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="addr"><strong>{p.title}</strong>{p.addr}</div>
                  
                  {/* ÍCONES DE CARACTERÍSTICAS */}
                  {(p.quartos || p.banheiros || p.garagem) && (
                    <div className="features-icons">
                      {p.quartos && p.quartos > 0 && (
                        <div className="feature-item">
                          <span>🛏️</span>
                          {p.quartos}
                        </div>
                      )}
                      {p.banheiros && p.banheiros > 0 && (
                        <div className="feature-item">
                          <span>🚿</span>
                          {p.banheiros}
                        </div>
                      )}
                      {p.garagem && p.garagem > 0 && (
                        <div className="feature-item">
                          <span>🚗</span>
                          {p.garagem}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {p.description && (
                    <div className="description-box">
                      {p.description}
                    </div>
                  )}
                  
                  <button className="btn-interest" onClick={() => {
                    setLeadForm({...leadForm, property: `${p.title} (Ref: ${p.id})`});
                    setIsDrawerOpen(true);
                  }}>
                    Solicitar Atendimento STR
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Drawer de leads */}
      <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} />
      <aside className="drawer">
        <div className="drawer-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
          <h2 style={{margin:0, color:'var(--accent)', fontSize: '24px', fontWeight: '900'}}>Novo Lead Recebido</h2>
          <button onClick={() => setIsDrawerOpen(false)} style={{background:'none', border:'none', fontSize:28, cursor:'pointer', color: '#94a3b8', transition: '0.3s'}}>✕</button>
        </div>
        
        <div style={{overflowY:'auto', flex:1}}>
          <div className="field"><label>Nome do Cliente</label><input type="text" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} /></div>
          <div className="field"><label>E-mail</label><input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} /></div>
          <div className="field"><label>WhatsApp</label><input type="tel" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} /></div>
          <div className="field"><label>Imóvel Selecionado</label><input type="text" value={leadForm.property} readOnly style={{background:'#f1f5f9'}} /></div>
          <div className="field"><label>Preferência de Contato</label><input type="datetime-local" value={leadForm.datetime} onChange={e => setLeadForm({...leadForm, datetime: e.target.value})} /></div>
          <div className="field"><label>Observações</label><textarea rows={4} value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} /></div>
          
          <button className="btn-interest" onClick={handleSendLead} disabled={isSending}>
            {isSending ? 'SALVANDO NO BANCO...' : 'ENVIAR PARA O BANCO E CONSULTOR'}
          </button>

          {leadResult && <div style={{marginTop:25, padding:20, background:'#ecfdf5', color:'#065f46', borderRadius:15, fontSize:14, fontWeight:700, border:'1px solid #a7f3d0', whiteSpace:'pre-wrap'}}>{leadResult}</div>}
          
          {agentPrompt && (
            <div style={{marginTop:25}}>
              <label style={{fontSize:11, color:'#94a3b8', fontWeight:900}}>DIRETRIZ PARA O CORRETOR:</label>
              <div className="prompt-box">{agentPrompt}</div>
              <button style={{marginTop:10, padding:'8px 15px', borderRadius:8, border:'1px solid var(--accent)', color:'var(--accent)', cursor:'pointer', fontWeight:700, transition: '0.3s'}} onClick={() => {navigator.clipboard.writeText(agentPrompt); alert('Copiado!');}}>COPIAR PROMPT</button>
            </div>
          )}
        </div>
      </aside>

      <button className="float-btn" onClick={() => setIsDrawerOpen(true)}>💬</button>

      <footer style={{textAlign:'center', padding:'80px 20px', color: 'var(--muted)', fontSize: '13px', background:'white', marginTop:'60px', borderTop:'1px solid #e2e8f0'}}>
        © 2026 Imobiliária Perto STR • Padrão <strong>STR Genetics Professional</strong>.
      </footer>
    </>
  );
}
