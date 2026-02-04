'use client'

import { useState } from 'react'

interface Props {
  imagens: string[]
  titulo: string
}

export default function GaleriaImovel({ imagens, titulo }: Props) {
  const [imagemAtiva, setImagemAtiva] = useState(0)

  if (!imagens || imagens.length === 0) {
    return (
      <div className="galeria-vazia">
        <span>📷</span>
        <p>Sem imagens disponíveis</p>
        <style jsx>{`
          .galeria-vazia {
            width: 100%;
            height: 400px;
            background: #e5e7eb;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
          }
          .galeria-vazia span { font-size: 48px; margin-bottom: 10px; }
          .galeria-vazia p { font-size: 14px; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="galeria">
      {/* IMAGEM PRINCIPAL */}
      <div className="imagem-principal">
        <img 
          src={imagens[imagemAtiva]} 
          alt={`${titulo} - Foto ${imagemAtiva + 1}`} 
        />
        
        {/* Contador */}
        <div className="contador">
          {imagemAtiva + 1} / {imagens.length}
        </div>

        {/* Navegação */}
        {imagens.length > 1 && (
          <>
            <button 
              className="nav-btn prev"
              onClick={() => setImagemAtiva(i => i === 0 ? imagens.length - 1 : i - 1)}
            >
              ‹
            </button>
            <button 
              className="nav-btn next"
              onClick={() => setImagemAtiva(i => i === imagens.length - 1 ? 0 : i + 1)}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {imagens.length > 1 && (
        <div className="thumbnails">
          {imagens.map((img: any, index: number) => (
            <button
              key={index}
              className={`thumb ${index === imagemAtiva ? 'ativo' : ''}`}
              onClick={() => setImagemAtiva(index)}
            >
              <img src={img} alt={`Miniatura ${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .galeria {
          width: 100%;
        }

        .imagem-principal {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: 12px;
          overflow: hidden;
          background: #e5e7eb;
        }

        .imagem-principal img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .contador {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: background 0.2s;
        }
        .nav-btn:hover {
          background: #fff;
        }
        .nav-btn.prev { left: 12px; }
        .nav-btn.next { right: 12px; }

        .thumbnails {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .thumb {
          width: 70px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          background: none;
          transition: border-color 0.2s, opacity 0.2s;
          opacity: 0.6;
        }
        .thumb:hover {
          opacity: 0.8;
        }
        .thumb.ativo {
          border-color: #2563eb;
          opacity: 1;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 600px) {
          .imagem-principal {
            height: 280px;
          }
          .thumb {
            width: 60px;
            height: 45px;
          }
        }
      `}</style>
    </div>
  )
}
