// Guarantor payments page — same 3-method payment flow as student portal
// Guarantor can pay on behalf of the linked student
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guarantorApi, uploadFileToS3 } from '../../lib/api'
import { format } from 'date-fns'
import { Zap, Loader2, CheckCircle, ExternalLink, CreditCard, Building2 } from 'lucide-react'
import clsx from 'clsx'
import api from '../../lib/api'

// Generate FORSA payment reference
function genRef(appId: string, seq: number) {
  return `FORSA-${new Date().getFullYear()}-${appId.slice(-6).toUpperCase()}-M${String(seq).padStart(2,'0')}`
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-0.5 border border-teal-200 rounded-md transition-colors">
      {copied ? '✓ Copié' : 'Copier'}
    </button>
  )
}

export default function PaymentsPage() {
  const qc = useQueryClient()
  const [selectedInst, setSelectedInst] = useState<string>('')
  const [method, setMethod] = useState<'konnect'|'bank'|'cash'>('konnect')
  const [form, setForm] = useState({ paymentDate: format(new Date(), 'yyyy-MM-dd'), amount: '', bankName: '', reference: '' })
  const [file, setFile] = useState<File | null>(null)
  const [konnectLoading, setKonnectLoading] = useState(false)
  const [konnectError, setKonnectError] = useState('')
  const [success, setSuccess] = useState(false)

  const { data } = useQuery({
    queryKey: ['guarantor-payments'],
    queryFn: () => guarantorApi.paymentSchedule().then(r => r.data),
  })

  const installments: any[] = data?.installments || []
  const schedule = data?.schedule
  const application = data?.application
  const nextDue = installments.find(i => !['paid','verified','waived'].includes(i.status))

  const submitMutation = useMutation({
    // T-111 — actually upload the file bytes before submitting the receipt
    // (previously only `file.name` was sent — Finance staff had nothing to
    // inspect). Same presigned-S3 flow the student portal now uses,
    // through the guarantor-scoped upload-url/confirm-upload routes since a
    // guarantor portal user holds none of the staff document.* permissions
    // POST /documents/upload-url requires directly.
    mutationFn: async (payload: any) => {
      let receiptDocumentId: string | null = null
      if (payload.file) {
        const { data: uploadInfo } = await guarantorApi.getReceiptUploadUrl({
          fileName: payload.file.name, contentType: payload.file.type,
        })
        await uploadFileToS3(uploadInfo.uploadUrl, payload.file)
        await guarantorApi.confirmReceiptUpload(uploadInfo.documentId, payload.file.size)
        receiptDocumentId = uploadInfo.documentId
      }
      const { file: _file, ...rest } = payload
      return guarantorApi.submitReceipt({ ...rest, receiptDocumentId })
    },
    onSuccess: () => { setSuccess(true); qc.invalidateQueries({ queryKey: ['guarantor-payments'] }) },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inst = installments.find(i => i.id === selectedInst) || nextDue
    if (!inst) return
    const ref = genRef(application?.id || 'UNKNOWN', inst.sequence_number)
    submitMutation.mutate({
      installmentId: inst.id,
      paymentDate: form.paymentDate,
      amount: parseFloat(form.amount) || parseFloat(inst.amount),
      bankName: form.bankName,
      referenceNumber: form.reference || ref,
      receiptFilename: file?.name || null,
      file,
      notes: `Paiement effectué par le garant. Banque: ${form.bankName}`,
    })
  }

  const handleKonnect = async () => {
    const inst = installments.find(i => i.id === selectedInst) || nextDue
    if (!inst) return
    setKonnectLoading(true); setKonnectError('')
    try {
      const ref = genRef(application?.id || 'UNKNOWN', inst.sequence_number)
      const r = await guarantorApi.initiateKonnect({ installmentId: inst.id, paymentReference: ref, amount: parseFloat(inst.amount) })
      if (r.data.payUrl) window.location.href = r.data.payUrl
      else setKonnectError("Impossible d'initier le paiement Konnect. Utilisez le virement bancaire.")
    } catch (err: any) {
      setKonnectError(err?.response?.data?.message || 'Paiement Konnect échoué. Utilisez le virement bancaire.')
    } finally { setKonnectLoading(false) }
  }

  const selectedInstData = installments.find(i => i.id === selectedInst) || nextDue

  if (success) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Reçu soumis avec succès</h2>
      <p className="text-sm text-gray-500 mb-6">L'équipe FORSA Finance vérifiera votre paiement dans les 24 heures.</p>
      <button onClick={() => setSuccess(false)} className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700">
        Retour aux paiements
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Effectuer un paiement</h1>
        <p className="text-sm text-gray-500 mt-0.5">Payez à la place de l'étudiant — trois méthodes disponibles</p>
      </div>

      {/* Installment selector */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sélectionner la mensualité</p>
        <div className="space-y-2">
          {installments.filter(i => !['paid','verified','waived'].includes(i.status)).map((inst: any) => (
            <label key={inst.id} className={clsx('flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all',
              selectedInst === inst.id ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300')}>
              <div className="flex items-center gap-3">
                <input type="radio" name="installment" value={inst.id} checked={selectedInst === inst.id}
                  onChange={() => { setSelectedInst(inst.id); setForm(f => ({ ...f, amount: inst.amount })) }} className="accent-teal-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Mensualité #{inst.sequence_number}
                    {' · '}{inst.due_date ? format(new Date(inst.due_date), 'dd MMM yyyy') : '—'}
                  </p>
                  {['late','default_risk'].includes(inst.status) && <p className="text-xs text-red-500">En retard</p>}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{Number(inst.amount).toLocaleString()} TND</span>
            </label>
          ))}
          {installments.filter(i => !['paid','verified','waived'].includes(i.status)).length === 0 && (
            <div className="text-center py-6 text-sm text-gray-400">
              <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
              Toutes les mensualités sont à jour
            </div>
          )}
        </div>
      </div>

      {selectedInstData && (
        <>
          {/* Konnect */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={15} className="text-teal-200" /><span className="text-xs font-bold text-teal-100 uppercase tracking-wide">Recommandé · Vérification automatique</span>
            </div>
            <p className="text-base font-bold mb-1">Payer en ligne avec Konnect</p>
            <p className="text-sm text-teal-100 mb-4">Paiement sécurisé par carte ou e-DINAR. Vérifié automatiquement — pas besoin de reçu.</p>
            {konnectError && <p className="text-xs text-red-200 mb-2">{konnectError}</p>}
            <button onClick={handleKonnect} disabled={konnectLoading}
              className="flex items-center gap-2 bg-white text-teal-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-60">
              {konnectLoading ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
              {konnectLoading ? 'Redirection…' : `Payer ${Number(selectedInstData.amount).toLocaleString()} TND avec Konnect`}
            </button>
            <p className="text-xs text-teal-200 mt-2">Des frais de traitement peuvent s'appliquer · Propulsé par Konnect</p>
          </div>

          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-100" /><span className="text-xs text-gray-400 font-medium">OU payer manuellement</span><div className="flex-1 h-px bg-gray-100" /></div>

          {/* Manual methods */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[{id:'bank',icon:Building2,label:'Virement bancaire'},{id:'cash',icon:CreditCard,label:'Dépôt espèces'}].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id as any)}
                  className={clsx('flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all',
                    method === m.id ? 'text-navy-800 border-navy-800' : 'text-gray-500 border-transparent hover:text-gray-700')}>
                  <m.icon size={14} />{m.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Bank details */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {method === 'bank' ? 'Coordonnées bancaires FORSA' : 'Agence bancaire Zitouna'}
                </p>
                {[
                  { label: 'Banque', value: 'Zitouna Bank' },
                  { label: 'Bénéficiaire', value: 'FORSA Tunisia' },
                  { label: 'RIB', value: '17 001 0001234567890 12' },
                  { label: 'IBAN', value: 'TN59 1700 1000 1234 5678 9012' },
                  { label: 'Référence paiement', value: genRef(application?.id || 'APP', selectedInstData.sequence_number) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-gray-800">{item.value}</span>
                      <CopyBtn text={item.value} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Receipt form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Après paiement — Soumettre le reçu</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Date de paiement</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-400"
                      value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Montant payé (TND)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-400"
                      value={form.amount || selectedInstData.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Banque</label>
                    <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-400"
                      value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="Zitouna Bank" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Référence</label>
                    <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-400 font-mono"
                      value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                      placeholder={genRef(application?.id || 'APP', selectedInstData.sequence_number)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Reçu (photo ou PDF)</label>
                  <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                </div>
                <button type="submit" disabled={submitMutation.isPending}
                  className="w-full py-2.5 bg-navy-900 text-white font-semibold text-sm rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                  Soumettre le reçu de paiement
                </button>
                {submitMutation.isError && <p className="text-xs text-red-500 text-center">Échec de la soumission. Réessayez.</p>}
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
