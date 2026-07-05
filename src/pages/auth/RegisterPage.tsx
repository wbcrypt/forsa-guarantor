import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../lib/api'

/**
 * T-102 — guarantor self-registration ("activer mon compte").
 *
 * A guarantor row is always created first by FORSA staff (via the Admin
 * Dashboard's student-detail "add guarantor" modal), which already captures
 * the guarantor's email. This page can therefore only *activate* portal
 * access for that existing record — it cannot create a guarantor from
 * scratch (there is no student to link it to). This intentionally does NOT
 * collect student-onboarding fields (date of birth, nationality, academic
 * level, etc.) — the previous version of this page was unadapted
 * student-portal template debris, per FORSA_PLATFORM_SPEC.md §2.6/§18.5.
 */
export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    tenantId: '', email: '', fullName: '', password: '', confirmPassword: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = (): string | null => {
    if (!form.tenantId || !form.email || !form.fullName || !form.password) return 'Tous les champs sont requis.'
    if (form.password.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères.'
    if (form.password !== form.confirmPassword) return 'Les mots de passe ne correspondent pas.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) { setError(v); return }
    setLoading(true); setError('')
    try {
      await authApi.registerGuarantor({
        tenantId: form.tenantId, email: form.email, password: form.password, fullName: form.fullName,
      })
      await login(form.email, form.password, form.tenantId)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Activation impossible. Vérifiez vos informations.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090f25] to-[#0F1C42] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FORSA" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white">Activer mon compte</h1>
          <p className="text-teal-300/70 text-sm mt-1">FORSA · Espace Garant</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
          )}
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Un membre de l'équipe FORSA vous a ajouté comme garant. Utilisez la même
            adresse e-mail pour activer votre accès au portail.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom complet</label>
              <input autoComplete="name"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={form.fullName} onChange={set('fullName')} placeholder="Sami Ben Ali" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Adresse e-mail</label>
              <input type="email" autoComplete="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={form.email} onChange={set('email')} placeholder="garant@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">ID Organisation</label>
              <input autoComplete="off"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={form.tenantId} onChange={set('tenantId')} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  className="w-full px-3 py-2.5 pe-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  value={form.password} onChange={set('password')} placeholder="Au moins 12 caractères" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmer le mot de passe</label>
              <input type={showPw ? 'text' : 'password'} autoComplete="new-password"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Activer mon compte
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-5">
            Déjà activé ?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
