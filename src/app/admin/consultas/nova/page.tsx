'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiService } from '@/lib/api-service'

export default function NovaConsulta() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  const [imoveis, setImoveis] = useState<any[]>([])
  
  const [form, setForm] = useState({
    leadId: '',
    imovelId: '',
    data: new Date().toISOString().split('T')[0],
    status: 'ABERTA',
    observacoes: ''
  })

  // Busca dados para os selects
  useEffect(() => {
    apiService.get('/api/leads').then(setLeads).catch(console.error)
    apiService.get('/api/imoveis').then(setImoveis).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      await apiService.post('/api/consultas', form)
      alert('📅 Consulta agendada com sucesso!')
      router.push('/admin/consultas')
      router.refresh()
    } catch (error: any) {
      alert('Falha ao salvar consulta: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#1877F2] p-6 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nova Consulta</h1>
          <Link href="/admin/consultas" className="text-white hover:underline">Voltar</Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Seleção de Lead */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente (Lead)</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              value={form.leadId}
              onChange={e => setForm({...form, leadId: e.target.value})}
              required
            >
              <option value="">Selecione o cliente...</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.nome} ({l.email})</option>
              ))}
            </select>
          </div>

          {/* Seleção de Imóvel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Imóvel de Interesse</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              value={form.imovelId}
              onChange={e => setForm({...form, imovelId: e.target.value})}
              required
            >
              <option value="">Selecione o imóvel...</option>
              {imoveis.map(i => (
                <option key={i.id} value={i.id}>{i.titulo} - {i.cidade}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Data da Visita/Contato</label>
              <input 
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg text-black"
                value={form.data}
                onChange={e => setForm({...form, data: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status Inicial</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
              >
                <option value="ABERTA">Aberta / Agendada</option>
                <option value="NEGOCIANDO">Em Negociação</option>
                <option value="PROPOSTA">Proposta Recebida</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg text-black"
              rows={4}
              placeholder="Detalhes sobre o interesse do cliente..."
              value={form.observacoes}
              onChange={e => setForm({...form, observacoes: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition ${
              isSubmitting ? 'bg-gray-400' : 'bg-[#1877F2] hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Salvar Consulta'}
          </button>
        </form>
      </div>
    </div>
  )
}
