'use client'

import Link from 'next/link'
import GaleriaImovel from './GaleriaImovel'

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string | null
  quartos?: number | null
  banheiros?: number | null
  garagem?: number | null
  metragem?: number | null
  finalidade?: string | null
}

interface Props {
  imovel: Imovel
}

export default function ImovelDetalhes({ imovel }: Props) {
  const whatsappNumber = '5511999999999' // ALTERE AQUI

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">🏠 Imobiliária</Link>
          <Link href="/admin" className="btn-login">🔐 Entrar</Link>
        </div>
      </header>

      <main className="main-content">
        <Link href="/" className="voltar-link">← Voltar para listagem</Link>

        <div className="conteudo-grid">
          {/* COLUNA ESQUERDA - GALERIA */}
          <div className="coluna-galeria">
            <GaleriaImovel imagens={imovel.imagens || []} titulo={imovel.title} />

            <section className="secao">
              <h2 className="secao-titulo">Descrição</h2>
              <p className="descricao-texto">{imovel.description || 'Sem descrição disponível.'}</p>
            </section>

            <section className="secao">
              <h2 className="secao-titulo">Características</h2>
              <div className="caracteristicas-grid">
                {imovel.quartos && imovel.quartos > 0 && (
                  <div className="caracteristica-item">
                    <span className="caracteristica-icone">🛏️</span>
                    <span className="caracteristica-valor">{imovel.quartos}</span>
                    <span className="caracteristica-label">Quartos</span>
                  </div>
                )}
                {imovel.banheiros && imovel.banheiros > 0 && (
                  <div className="caracteristica-item">
                    <span className="caracteristica-icone">🚿</span>
                    <span className="caracteristica-valor">{imovel.banheiros}</span>
                    <span className="caracteristica-label">Banheiros</span>
                  </div>
                )}
                {imovel.garagem && imovel.garagem > 0 && (
                  <div className="caracteristica-item">
                    <span className="caracteristica-icone">🚗</span>
                    <span className="caracteristica-valor">{imovel.garagem}</span>
                    <span className="caracteristica-label">Vagas</span>
                  </div>
                )}
                {imovel.metragem && imovel.metragem > 0 && (
                  <div className="caracteristica-item">
                    <span className="caracteristica-icone">📐</span>
                    <span className="caracteristica-valor">{imovel.metragem}m²</span>
                    <span className="caracteristica-label">Área</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - INFO E CONTATO */}
          <aside className="coluna-info">
            <div className="card-contato">
              <div className="badges">
                <span className="badge badge-tipo">{imovel.type}</span>
                {imovel.finalidade && (
                  <span className={`badge ${imovel.finalidade === 'Venda' ? 'badge-venda' : 'badge-aluguel'}`}>
                    {imovel.finalidade}
                  </span>
                )}
              </div>

              <h1 className="imovel-titulo">{imovel.title}</h1>
              <p className="imovel-endereco">📍 {imovel.addr}</p>

              <div className="preco-box">
                <div className="preco-label">Valor</div>
                <div className="preco-valor">R$ {imovel.price.toLocaleString('pt-BR')}</div>
              </div>

              <div className="codigo">Código: <strong>{imovel.id.slice(0, 8)}</strong></div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=Olá! Tenho interesse no imóvel ${imovel.id.slice(0, 8)} - ${imovel.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                💬 Chamar no WhatsApp
              </a>

              <button className="btn-ligar">📞 Solicitar ligação</button>
            </div>
          </aside>
        </div>
      </main>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: #f9fafb;
        }
        .header {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          text-decoration: none;
        }
        .btn-login {
          background: #1f2937;
          color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .voltar-link {
          display: inline-block;
          color: #2563eb;
          text-decoration: none;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        /* GRID PRINCIPAL - Larguras fixas */
        .conteudo-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          align-items: start;
        }

        .coluna-galeria {
          min-width: 0;
        }

        .coluna-info {
          width: 360px;
          flex-shrink: 0;
        }

        .secao {
          margin-top: 32px;
        }
        .secao-titulo {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 14px;
          color: #1f2937;
        }
        .descricao-texto {
          color: #4b5563;
          line-height: 1.7;
          white-space: pre-wrap;
          font-size: 14px;
        }

        .caracteristicas-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .caracteristica-item {
          padding: 14px 10px;
          background: #fff;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .caracteristica-icone {
          display: block;
          font-size: 22px;
          margin-bottom: 4px;
        }
        .caracteristica-valor {
          display: block;
          font-weight: 600;
          color: #1f2937;
          font-size: 15px;
        }
        .caracteristica-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        /* CARD DE CONTATO - Fixo no topo */
        .card-contato {
          position: sticky;
          top: 80px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          padding: 20px;
        }

        .badges {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }
        .badge-tipo { background: #2563eb; }
        .badge-venda { background: #16a34a; }
        .badge-aluguel { background: #ea580c; }

        .imovel-titulo {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .imovel-endereco {
          color: #6b7280;
          font-size: 13px;
          margin: 0 0 16px;
        }

        .preco-box {
          background: #eff6ff;
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .preco-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .preco-valor {
          font-size: 28px;
          font-weight: 700;
          color: #2563eb;
        }

        .codigo {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        .codigo strong { color: #1f2937; }

        .btn-whatsapp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: #25d366;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 10px;
        }
        .btn-whatsapp:hover {
          background: #1fb855;
        }

        .btn-ligar {
          width: 100%;
          padding: 14px;
          background: #1f2937;
          color: #fff;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
        }
        .btn-ligar:hover {
          background: #374151;
        }

        /* RESPONSIVO */
        @media (max-width: 900px) {
          .conteudo-grid {
            grid-template-columns: 1fr;
          }
          .coluna-info {
            width: 100%;
          }
          .card-contato {
            position: static;
          }
          .caracteristicas-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .main-content { padding: 16px; }
          .header-content { padding: 12px 16px; }
          .preco-valor { font-size: 24px; }
          .imovel-titulo { font-size: 18px; }
        }
      `}</style>
    </div>
  )
}
