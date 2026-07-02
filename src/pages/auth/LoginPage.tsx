import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.tenantId) { setError('Tous les champs sont requis.'); return }
    setLoading(true); setError('')
    try { await login(form.email, form.password, form.tenantId); navigate('/') }
    catch (err: any) { setError(err?.response?.data?.message || 'Identifiants incorrects.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090f25] to-[#0F1C42] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FORSA" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white">Portail Garant</h1>
          <p className="text-teal-300/70 text-sm mt-1">FORSA · Espace Garant</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Adresse e-mail</label>
              <input type="email" autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={form.email} onChange={set('email')} placeholder="garant@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  className="w-full px-3 py-2.5 pe-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  value={form.password} onChange={set('password')} placeholder="••••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">ID Organisation</label>
              <input autoComplete="off"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={form.tenantId} onChange={set('tenantId')} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Se connecter
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
            Vous avez reçu un e-mail d'invitation de FORSA.<br/>
            Utilisez les identifiants créés lors de votre activation.
          </p>
        </div>
      </div>
    </div>
  )
}
