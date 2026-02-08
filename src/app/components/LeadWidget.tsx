'use client'

import { useState } from 'react'

export default function LeadWidget() {
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadForm, setLeadForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviarLead(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadForm, origem: 'site', status: 'novo' }),
      })
      if (res.ok) {
        setEnviado(true)
        setLeadForm({ nome: '', email: '', telefone: '', mensagem: '' })
        setTimeout(() => {
          setEnviado(false)
          setShowLeadForm(false)
        }, 3000)
      }
    } catch (error: any) {
      console.error('Erro ao enviar lead:', error)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className={`lead-widget ${showLeadForm ? 'aberto' : ''}`}
      onMouseEnter={() => setShowLeadForm(true)}
      onMouseLeave={() => !enviado && setShowLeadForm(false)}
    >
      <div className="lead-btn">💬</div>
      <div className="lead-box">
        {enviado ? (
          <div className="sucesso">✅ Enviado!</div>
        ) : (
          <form onSubmit={enviarLead}>
            <h4>Fale Conosco</h4>
            <input
              type="text"
              placeholder="Nome"
              value={leadForm.nome}
              onChange={(e) =>
                setLeadForm(f => ({ ...f, nome: e.target.value }))
              }
              required
            />
            <input
              type="email"
              placeholder="E-mail"
              value={leadForm.email}
              onChange={(e) =>
                setLeadForm(f => ({ ...f, email: e.target.value }))
              }
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp"
              value={leadForm.telefone}
              onChange={(e) =>
                setLeadForm(f => ({ ...f, telefone: e.target.value }))
              }
              required
            />
            <textarea
              placeholder="Mensagem"
              value={leadForm.mensagem}
              onChange={(e) =>
                setLeadForm(f => ({ ...f, mensagem: e.target.value }))
              }
              rows={2}
            />
            <button type="submit" disabled={enviando}>
              {enviando ? '...' : 'Enviar'}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .lead-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        .lead-btn {
          width: 56px;
          height: 56px;
          background: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
        }
        .lead-box {
          position: absolute;
          bottom: 66px;
          right: 0;
          width: 280px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          padding: 20px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s;
        }
        .lead-widget.aberto .lead-box {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .lead-box h4 {
          margin: 0 0 14px;
          font-size: 16px;
        }
        .lead-box input,
        .lead-box textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 13px;
          box-sizing: border-box;
        }
        .lead-box button {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .lead-box button:disabled {
          background: #93c5fd;
        }
        .sucesso {
          text-align: center;
          padding: 20px;
          font-size: 18px;
        }
      `}</style>
    </div>
  )
}

