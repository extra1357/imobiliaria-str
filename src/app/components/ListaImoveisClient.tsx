'use client'

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react'
import Link from 'next/link'
import LeadWidget from './LeadWidget' // componente LeadWidget separado

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string
  quartos?: number
  banheiros?: number
  garagem?: number
  metragem?: number
  finalidade?: string
}

export default function ListaImoveisClient({
  initialData,
}: {
  initialData: Imovel[]
}) {
  const [properties] = useState<Imovel[]>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 8

  const filteredProperties = useMemo(() => {
    return properties.filter((p: any) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.addr.toLowerCase().includes(q) ||
        String(p.id).toLowerCase().includes(q)
      const matchType = filterType === 'all' || p.type === filterType
      const matchPrice = !maxPrice || p.price <= Number(maxPrice.replace(/\D/g, ''))
      return matchSearch && matchType && matchPrice
    })
  }, [properties, searchQuery, filterType, maxPrice])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProperties, currentPage])

  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, maxPrice])

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">🏠 Imobiliária</Link>
          <Link href="/admin" className="btn-login">🔐 Entrar</Link>
        </div>
      </header>

      <main className="main-content">
        <div className="filtros">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="input"
          />
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="select"
          >
            <option value="all">Todos</option>
            <option value="Casa">Casas</option>
            <option value="Apartamento">Apartamentos</option>
            <option value="Terreno">Terrenos</option>
            <option value="Comercial">Comercial</option>
          </select>
          <input
            type="text"
            placeholder="Preço máx."
            value={maxPrice}
            onChange={(e: any) => setMaxPrice(e.target.value)}
            className="input input-preco"
          />
        </div>

        <p className="contador">{filteredProperties.length} imóveis encontrados</p>

        <div className="grid">
          {paginatedProperties.map((p: any) => (
            <Link href={`/imoveis/${p.id}`} key={p.id} className="card-link">
              <article className="card">
                <div className="card-img">
                  <img src={p.imagens?.[0] || '/placeholder.jpg'} alt={p.title} />
                  <span className="tag tipo">{p.type}</span>
                  {p.finalidade && (
                    <span className={`tag finalidade ${p.finalidade.toLowerCase()}`}>
                      {p.finalidade}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-endereco">{p.addr}</p>
                  <div className="card-features">
                    {p.quartos ? <span>🛏️ {p.quartos}</span> : null}
                    {p.banheiros ? <span>🚿 {p.banheiros}</span> : null}
                    {p.garagem ? <span>🚗 {p.garagem}</span> : null}
                    {p.metragem ? <span>📐 {p.metragem}m²</span> : null}
                  </div>
                  <div className="card-preco">R$ {p.price.toLocaleString('pt-BR')}</div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {paginatedProperties.length === 0 && (
          <div className="vazio">Nenhum imóvel encontrado</div>
        )}

        {totalPages > 1 && (
          <div className="paginacao">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg: any) => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={currentPage === pg ? 'ativo' : ''}>{pg}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>→</button>
          </div>
        )}
      </main>

      {/* Widget de lead separado */}
      <LeadWidget />

      {/* Aqui você mantém o CSS todo que já tinha */}
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
    max-width: 1400px;
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

  .btn-login:hover {
    background: #374151;
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
  }

  .filtros {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .input, .select {
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    background: #fff;
  }

  .input {
    flex: 1;
    min-width: 150px;
  }

  .input-preco {
    flex: 0;
    width: 120px;
  }

  .contador {
    color: #6b7280;
    margin-bottom: 20px;
    font-size: 14px;
  }

  /* GRID - 4 colunas */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 8px rgba(0,0,0,0.08);
    transition: transform 0.2s, box-shadow 0.2s;
    height: 340px;
    display: flex;
    flex-direction: column;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  }

  .card-img {
    position: relative;
    width: 100%;
    height: 180px;
    flex-shrink: 0;
    overflow: hidden;
    background: #e5e7eb;
  }

  .card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .tag {
    position: absolute;
    top: 10px;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }

  .tag.tipo {
    left: 10px;
    background: #2563eb;
  }

  .tag.finalidade {
    right: 10px;
  }

  .tag.venda {
    background: #16a34a;
  }

  .tag.aluguel {
    background: #ea580c;
  }

  .card-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    height: 160px;
    overflow: hidden;
  }

  .card-title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-endereco {
    margin: 0 0 8px;
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-features {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: #6b7280;
    flex-wrap: wrap;
  }

  .card-preco {
    margin-top: auto;
    padding-top: 10px;
    font-size: 18px;
    color: #2563eb;
    font-weight: 700;
  }

  .vazio {
    text-align: center;
    padding: 60px;
    color: #9ca3af;
  }

  .paginacao {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 32px;
  }

  .paginacao button {
    padding: 8px 14px;
    border: none;
    border-radius: 6px;
    background: #e5e7eb;
    cursor: pointer;
    font-size: 14px;
  }

  .paginacao button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .paginacao button.ativo {
    background: #2563eb;
    color: #fff;
  }

  /* RESPONSIVO */
  @media (max-width: 1200px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
    .card { height: 320px; }
    .card-img { height: 160px; }
    .card-body { height: 160px; }
  }

  @media (max-width: 600px) {
    .grid { grid-template-columns: 1fr; }
    .card { height: 300px; }
    .card-img { height: 150px; }
    .card-body { height: 150px; }
    .header-content { padding: 12px 16px; }
    .main-content { padding: 16px; }
    .filtros { flex-direction: column; }
    .input, .input-preco { width: 100%; flex: none; }
  }
`}</style>

    </div>
  )
}

