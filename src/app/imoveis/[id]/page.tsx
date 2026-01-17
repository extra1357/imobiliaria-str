'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Imovel {
  id: string;
  tipo: string;
  titulo: string;
  endereco: string;
  preco: number;
  imagens: string[];
  descricao: string;
  caracteristicas: string[];
  quartos?: number;
  banheiros?: number;
  garagem?: number;
  area?: number;
}

export default function ImovelDetalhes({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function loadImovel() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/imoveis/${params.id}`, { next: { revalidate: 3600 } });
        const data = await res.json();
        setImovel(data);
      } catch (err) {
        console.error("Erro ao carregar imóvel:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadImovel();
  }, [params.id]);

  if (isLoading) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
        <div style={{fontSize:18, color:'#64748b'}}>Carregando...</div>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', gap:20}}>
        <div style={{fontSize:48}}>😕</div>
        <div style={{fontSize:20, color:'#64748b'}}>Imóvel não encontrado</div>
        <button onClick={() => router.push('/imoveis-publicos')} style={{padding:'12px 24px', background:'#1e40af', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700}}>
          ← Voltar
        </button>
      </div>
    );
  }

  const imagens = Array.isArray(imovel.imagens) ? imovel.imagens : JSON.parse(imovel.imagens || '[]');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f0f4f8; color: #0f172a; }
        
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .back-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
        }
        .back-btn:hover {
          background: white;
          color: #1e40af;
        }
        
        .container {
          max-width: 1400px;
          margin: 40px auto;
          padding: 0 20px;
        }
        
        .layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }
        
        /* GALERIA ESQUERDA - SIMPLES */
        .gallery {
          padding: 40px;
          background: #f8fafc;
        }
        
        .main-image {
          width: 100%;
          height: 500px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
          background: #e2e8f0;
        }
        
        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* SETAS SIMPLES */
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.95);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 900;
          color: #1e40af;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: 0.3s;
        }
        .arrow:hover {
          background: #1e40af;
          color: white;
          transform: translateY(-50%) scale(1.1);
        }
        .arrow-left { left: 20px; }
        .arrow-right { right: 20px; }
        
        /* THUMBNAILS SIMPLES */
        .thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .thumb {
          height: 80px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.6;
          transition: 0.3s;
          border: 3px solid transparent;
        }
        .thumb:hover { opacity: 1; }
        .thumb.active { 
          opacity: 1;
          border-color: #1e40af;
          box-shadow: 0 0 0 2px #1e40af;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* INFO DIREITA */
        .info {
          padding: 40px;
        }
        
        .type-badge {
          background: #eef2ff;
          color: #1e40af;
          padding: 8px 18px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 20px;
        }
        
        .price {
          font-size: 42px;
          font-weight: 900;
          color: #1e40af;
          margin-bottom: 15px;
        }
        
        .address {
          font-size: 18px;
          color: #475569;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .address strong {
          display: block;
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }
        
        /* ÍCONES */
        .features {
          display: flex;
          gap: 30px;
          padding: 25px 0;
          border-top: 2px solid #f1f5f9;
          border-bottom: 2px solid #f1f5f9;
          margin-bottom: 30px;
        }
        .feature {
          text-align: center;
          flex: 1;
        }
        .feature-icon {
          font-size: 36px;
          margin-bottom: 8px;
        }
        .feature-number {
          font-size: 24px;
          font-weight: 900;
          color: #1e40af;
          display: block;
        }
        .feature-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .description-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 15px;
        }
        .description-text {
          font-size: 15px;
          line-height: 1.8;
          color: #475569;
          margin-bottom: 30px;
        }
        
        .action-btns {
          display: flex;
          gap: 15px;
        }
        .btn {
          flex: 1;
          padding: 18px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: 0.3s;
          border: none;
          text-transform: uppercase;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.4);
        }
        .btn-secondary {
          background: white;
          color: #1e40af;
          border: 2px solid #1e40af;
        }
        .btn-secondary:hover {
          background: #1e40af;
          color: white;
        }
        
        @media (max-width: 1024px) {
          .layout { grid-template-columns: 1fr; }
        }
      ` }} />

      <div className="header">
        <div className="header-content">
          <button className="back-btn" onClick={() => router.push('/imoveis-publicos')}>
            ← Voltar
          </button>
          <div>
            <h1 style={{fontSize: 24, fontWeight: 900}}>Detalhes do Imóvel</h1>
            <p style={{fontSize: 14, opacity: 0.9, marginTop: 5}}>Imobiliária Perto STR</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="layout">
          {/* GALERIA ESQUERDA */}
          <div className="gallery">
            {/* FOTO PRINCIPAL */}
            <div className="main-image">
              {imagens.length > 0 ? (
                <>
                  <img src={imagens[currentImageIndex]} alt={imovel.titulo} />
                  
                  {/* SETAS (só aparecem se tiver mais de 1 foto) */}
                  {imagens.length > 1 && (
                    <>
                      <button 
                        className="arrow arrow-left"
                        onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : imagens.length - 1)}
                      >
                        ‹
                      </button>
                      <button 
                        className="arrow arrow-right"
                        onClick={() => setCurrentImageIndex(i => (i + 1) % imagens.length)}
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8'}}>
                  Sem imagem
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            {imagens.length > 1 && (
              <div className="thumbs">
                {imagens.map((img: string, i: number) => (
                  <div 
                    key={i}
                    className={`thumb ${currentImageIndex === i ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(i)}
                  >
                    <img src={img} alt={`Foto ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO DIREITA */}
          <div className="info">
            <div className="type-badge">{imovel.tipo}</div>
            
            <div className="price">
              R$ {imovel.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            
            <div className="address">
              <strong>{imovel.titulo}</strong>
              📍 {imovel.endereco}
            </div>

            {/* ÍCONES */}
            {(imovel.quartos || imovel.banheiros || imovel.garagem || imovel.area) && (
              <div className="features">
                {imovel.quartos && imovel.quartos > 0 && (
                  <div className="feature">
                    <div className="feature-icon">🛏️</div>
                    <span className="feature-number">{imovel.quartos}</span>
                    <div className="feature-label">Quartos</div>
                  </div>
                )}
                {imovel.banheiros && imovel.banheiros > 0 && (
                  <div className="feature">
                    <div className="feature-icon">🚿</div>
                    <span className="feature-number">{imovel.banheiros}</span>
                    <div className="feature-label">Banheiros</div>
                  </div>
                )}
                {imovel.garagem && imovel.garagem > 0 && (
                  <div className="feature">
                    <div className="feature-icon">🚗</div>
                    <span className="feature-number">{imovel.garagem}</span>
                    <div className="feature-label">Garagem</div>
                  </div>
                )}
                {imovel.area && imovel.area > 0 && (
                  <div className="feature">
                    <div className="feature-icon">📐</div>
                    <span className="feature-number">{imovel.area}</span>
                    <div className="feature-label">m²</div>
                  </div>
                )}
              </div>
            )}

            {/* DESCRIÇÃO */}
            <div className="description-title">📝 Descrição</div>
            <div className="description-text">
              {imovel.descricao || 'Sem descrição disponível.'}
            </div>

            {/* BOTÕES */}
            <div className="action-btns">
              <button className="btn btn-primary" onClick={() => router.push('/')}>
                ← Voltar para Página Principal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
