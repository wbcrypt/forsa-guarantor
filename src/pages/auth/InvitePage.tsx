// The only entry point into the guarantor portal: a secure, single-use,
// expiring link emailed when FORSA staff adds this person as a guarantor
// (students.service.ts#addGuarantor on the backend). There is no public
// self-registration — a guarantor can never invent this relationship.
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { inviteApi } from '../../lib/api'

type Preview = {
  guarantorFirstName: string
  guarantorLastName: string
  email: string
  tenantId: string
  studentFirstName: string
  expiresAt: string
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [preview, setPreview] = useState<Preview | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(true)

  const [mode, setMode] = useState<'review' | 'accept' | 'decline'>('review')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [declined, setDeclined] = useState(false)

  useEffect(() => {
    if (!token) { setLoadError('Ce lien d\'invitation est incomplet.'); setLoadingPreview(false); return }
    inviteApi.preview(token)
      .then(res => setPreview(res.data))
      .catch(err => setLoadError(err?.response?.data?.message || 'Ce lien d\'invitation est invalide.'))
      .finally(() => setLoadingPreview(false))
  }, [token])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 12) { setActionError('Le mot de passe doit contenir au moins 12 caractères.'); return }
    if (password !== confirmPassword) { setActionError('Les mots de passe ne correspondent pas.'); return }
    setSubmitting(true); setActionError('')
    try {
      await inviteApi.accept(token!, password)
      await login(preview!.email, password, preview!.tenantId)
      navigate('/')
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Impossible d\'activer votre compte.')
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    setSubmitting(true); setActionError('')
    try {
      await inviteApi.decline(token!, declineReason || undefined)
      setDeclined(true)
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Impossible de refuser cette invitation.')
    } finally { setSubmitting(false) }
  }

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-[#090f25] to-[#0F1C42] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FORSA" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white">Invitation Garant</h1>
          <p className="text-teal-300/70 text-sm mt-1">FORSA · Espace Garant</p>
        </div>
        <div className="bg-white rounded-2xl p-7 shadow-2xl">{children}</div>
      </div>
    </div>
  )

  if (loadingPreview) {
    return <Shell><div className="flex justify-center py-6"><Loader2 size={22} className="animate-spin text-teal-600" /></div></Shell>
  }

  if (loadError) {
    return (
      <Shell>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-2">{loadError}</div>
        <p className="text-xs text-gray-400 mt-4">
          Si vous pensez qu'il s'agit d'une erreur, demandez à l'étudiant de contacter son interlocuteur FORSA pour un nouveau lien.
        </p>
        <p className="text-center text-xs text-gray-400 mt-5">
          <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">Se connecter</Link>
        </p>
      </Shell>
    )
  }

  if (declined) {
    return (
      <Shell>
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X size={22} className="text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">Invitation refusée</p>
          <p className="text-xs text-gray-500 mt-1.5">
            L'équipe FORSA a été informée. Aucun compte n'a été créé.
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="flex items-center gap-2 mb-4 text-teal-700 bg-teal-50 rounded-xl px-3 py-2">
        <ShieldCheck size={16} />
        <p className="text-xs font-medium">Invitation vérifiée</p>
      </div>

      <p className="text-sm text-gray-700 mb-1">
        Bonjour <strong>{preview!.guarantorFirstName}</strong>,
      </p>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        <strong>{preview!.studentFirstName}</strong> vous a désigné(e) comme garant(e) pour son plan de facilitation des frais de scolarité FORSA
        (<span className="font-mono text-xs">{preview!.email}</span>). En acceptant, vous pourrez suivre son dossier et effectuer des paiements en son nom.
      </p>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{actionError}</div>
      )}

      {mode === 'review' && (
        <div className="flex flex-col gap-2">
          <button onClick={() => setMode('accept')} className="w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
            Accepter et créer mon compte
          </button>
          <button onClick={() => setMode('decline')} className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Refuser cette invitation
          </button>
        </div>
      )}

      {mode === 'accept' && (
        <form onSubmit={handleAccept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} autoComplete="new-password"
                className="w-full px-3 py-2.5 pe-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Au moins 12 caractères" />
              <button type="button" aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPw(!showPw)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmer le mot de passe</label>
            <input type={showPw ? 'text' : 'password'} autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••••" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Activer mon compte
          </button>
          <button type="button" onClick={() => setMode('review')} className="w-full text-xs text-gray-400 hover:text-gray-600">
            Retour
          </button>
        </form>
      )}

      {mode === 'decline' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Raison (optionnel)</label>
            <textarea rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              value={declineReason} onChange={e => setDeclineReason(e.target.value)}
              placeholder="Ex : je ne peux pas assumer ce rôle actuellement" />
          </div>
          <button onClick={handleDecline} disabled={submitting}
            className="w-full py-2.5 bg-red-50 text-red-700 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Confirmer le refus
          </button>
          <button type="button" onClick={() => setMode('review')} className="w-full text-xs text-gray-400 hover:text-gray-600">
            Retour
          </button>
        </div>
      )}
    </Shell>
  )
}
