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

  // Estado para lightbox de imagens com navegação
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const agents: Agent[] = [
    { id: 'AG001', name: 'João Silva', phone: '+5511999000001', role: 'Especialista Residencial' },
    { id: 'AG002', name: 'Mariana Alves', phone: '+5511999000002', role: 'Gestora de Lançamentos' }
  ];

  useEffect(() => {
    async function loadDataFromPostgres() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/imoveis', { cache: 'no-store' });
        const data = await res.json();
        
        const mapped = data.map((p: any) => ({
          id: String(p.id || ''),
          type: String(p.tipo || 'casa'),
          title: String(p.titulo || 'Imóvel sem título'),
          addr: String(p.endereco || 'Consulte localização'),
          price: Number(p.preco || 0),
          imagens: Array.isArray(p.imagens) ? p.imagens : JSON.parse(p.imagens || '[]'),
          description: String(p.descricao || ''),
          features: Array.isArray(p.caracteristicas) ? p.caracteristicas : []
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

  // Funções do lightbox
  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Teclas do teclado para navegação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxImages.length]);

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
        .filter-bar { background:white; padding:25px; border-radius:20px; box-shadow:0 4px 20px rgba(0,0,0,0.05); display:flex; gap:20px; margin-bottom:40px; align-items:flex-end; border:1px solid #e2e8f0; }
        .input-group { display:flex; flex-direction:column; gap:8px; flex:1; }
        .input-group label { font-size:12px; font-weight:800; color:var(--muted); text-transform: uppercase; }
        input, select, textarea { padding:14px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:15px; background:#f8fafc; width:100%; }
        .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:35px; }
        .card { background:white; border-radius:24px; overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.06); border:1px solid #f1f5f9; transition:0.3s ease-out; display:flex; flex-direction:column; }
        .card:hover { transform: translateY(-10px); box-shadow:0 25px 50px rgba(0,0,0,0.12); }
        .card-swiper { width:100%; height:280px; }
        .card-swiper img { width:100%; height:100%; object-fit:cover; cursor:pointer; transition: transform 0.3s; }
        .card-swiper img:hover { transform: scale(1.05); }
        .card-body { padding:28px; flex:1; display:flex; flex-direction:column; }
        .price { font-size:28px; font-weight:900; color:var(--accent); margin-bottom:12px; }
        .addr { font-size:15px; color:var(--muted); margin-bottom:20px; min-height:48px; }
        .description-box { 
          max-height: 96px;
          overflow-y: auto;
          font-size: 14px;
          color: #475569;
          line-height: 24px;
          margin-bottom: 15px;
          padding-right: 8px;
          border-left: 3px solid #e2e8f0;
          padding-left: 12px;
        }
        .description-box::-webkit-scrollbar { width: 6px; }
        .description-box::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .description-box::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .description-box::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .btn-interest { background:var(--accent); color:white; width:100%; padding:18px; border:none; border-radius:14px; font-weight:800; cursor:pointer; transition:0.3s; text-transform:uppercase; }
        .btn-interest:disabled { background:#cbd5e1; cursor:not-allowed; }
        .drawer-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.7); z-index:1999; display: ${isDrawerOpen ? 'block' : 'none'}; backdrop-filter: blur(6px); }
        .drawer { position:fixed; right:0; top:0; height:100%; width:480px; max-width:100%; background:white; z-index:2000; padding:40px; display: ${isDrawerOpen ? 'flex' : 'none'}; flex-direction:column; box-shadow:-20px 0 60px rgba(0,0,0,0.3); }
        .field { margin-bottom:20px; display:flex; flex-direction:column; gap:8px; }
        .field label { font-size:13px; font-weight:800; color:var(--text); text-transform:uppercase; }
        .prompt-box { background:#0f172a; color:#cbd5e1; padding:20px; border-radius:15px; font-size:13px; margin-top:20px; white-space:pre-wrap; }
        .float-btn { position:fixed; right:40px; bottom:40px; background:var(--accent); color:white; width:70px; height:70px; border-radius:50%; border:none; cursor:pointer; z-index:1500; font-size:24px; box-shadow:0 15px 35px rgba(30,64,175,0.4); }
        
        /* Lightbox com navegação */
        .lightbox-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.95); 
          z-index: 3000; 
          display: ${isLightboxOpen ? 'flex' : 'none'}; 
          align-items: center; 
          justify-content: center; 
          padding: 20px;
          backdrop-filter: blur(10px);
        }
        .lightbox-image { 
          max-width: 85%; 
          max-height: 85vh; 
          object-fit: contain; 
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .lightbox-close { 
          position: absolute; 
          top: 30px; 
          right: 30px; 
          background: white; 
          color: #0f172a; 
          border: none; 
          width: 50px; 
          height: 50px; 
          border-radius: 50%; 
          font-size: 24px; 
          cursor: pointer; 
          font-weight: 900;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: 0.3s;
          z-index: 3001;
        }
        .lightbox-close:hover {
          transform: scale(1.1);
          background: #f1f5f9;
        }
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          color: #0f172a;
          border: none;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          font-size: 28px;
          cursor: pointer;
          font-weight: 900;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: 0.3s;
          z-index: 3001;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-nav:hover {
          transform: translateY(-50%) scale(1.1);
          background: var(--accent);
          color: white;
        }
        .lightbox-nav-prev { left: 30px; }
        .lightbox-nav-next { right: 30px; }
        .lightbox-counter {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.95);
          color: #0f172a;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
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
          <div style={{textAlign:'center', padding:'100px'}}>Carregando dados do Postgres STR...</div>
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
                        onClick={() => openLightbox(p.imagens, i)}
                      />
                    </SwiperSlide>
                  )) : (
                    <SwiperSlide>
                      <div style={{background:'#f1f5f9', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        Sem imagem
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
                
                <div className="card-body">
                  <div style={{background:'#eef2ff', color:'var(--accent)', padding:'6px 14px', borderRadius:'50px', fontSize:'11px', fontWeight:800, textTransform:'uppercase', marginBottom:'15px', width:'fit-content'}}>
                    {p.type}
                  </div>
                  <div className="price">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="addr"><strong>{p.title}</strong><br/>{p.addr}</div>
                  
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
          <h2 style={{margin:0, color:'var(--accent)'}}>Novo Lead Recebido</h2>
          <button onClick={() => setIsDrawerOpen(false)} style={{background:'none', border:'none', fontSize:28, cursor:'pointer', color: '#94a3b8'}}>✕</button>
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
              <button style={{marginTop:10, padding:'8px 15px', borderRadius:8, border:'1px solid var(--accent)', color:'var(--accent)', cursor:'pointer', fontWeight:700}} onClick={() => {navigator.clipboard.writeText(agentPrompt); alert('Copiado!');}}>COPIAR PROMPT</button>
            </div>
          )}
        </div>
      </aside>

      {/* Lightbox com navegação */}
      <div className="lightbox-overlay" onClick={closeLightbox}>
        <button className="lightbox-close" onClick={closeLightbox}>✕</button>
        
        {lightboxImages.length > 1 && (
          <>
            <button 
              className="lightbox-nav lightbox-nav-prev" 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              ‹
            </button>
            <button 
              className="lightbox-nav lightbox-nav-next" 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              ›
            </button>
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          </>
        )}
        
        {lightboxImages[currentImageIndex] && (
          <img 
            src={lightboxImages[currentImageIndex]} 
            alt="Imagem ampliada" 
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <button className="float-btn" onClick={() => setIsDrawerOpen(true)}>💬</button>

      <footer style={{textAlign:'center', padding:'80px 20px', color: 'var(--muted)', fontSize: '13px', background:'white', marginTop:'60px', borderTop:'1px solid #e2e8f0'}}>
        © 2026 Imobiliária Perto STR • Padrão <strong>STR Genetics Professional</strong>.
      </footer>
    </>
  );
}
