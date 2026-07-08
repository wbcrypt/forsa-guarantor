import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guarantorApi } from '../../lib/api'
import { format } from 'date-fns'
import { CheckCircle, Clock, AlertTriangle, CreditCard, ClipboardList, Calendar } from 'lucide-react'
import clsx from 'clsx'

function StatusBadge({ status }: { status: string }) {
  // Found alongside the "no linked student until an application exists"
  // bug: a linked student with no application yet passed an empty string
  // here, rendering a blank grey pill with no visible text.
  if (!status) {
    return <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">Pas encore de demande</span>
  }
  const cfg: Record<string, string> = {
    applied: 'bg-blue-50 text-blue-700',
    pre_approved: 'bg-teal-50 text-teal-700',
    active_student: 'bg-green-50 text-green-700',
    contracts_signed: 'bg-purple-50 text-purple-700',
    rejected: 'bg-amber-50 text-amber-700',
  }
  const labels: Record<string, string> = {
    applied: 'Candidature soumise', pre_approved: 'Pré-approuvé',
    active_student: 'Étudiant actif', contracts_signed: 'Contrats signés',
    rejected: 'Non approuvé', internal_review: "En cours d'examen",
    activation_meeting: "Réunion d'activation",
  }
  return <span className={clsx('text-xs font-semibold px-3 py-1 rounded-full', cfg[status] || 'bg-gray-100 text-gray-600')}>{labels[status] || status}</span>
}

function FinancialProfileForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    employmentDurationYears: '', salaryRange: '', incomeSource: '', maritalStatus: '',
    numberOfDependents: '', homeOwnership: '', monthlyExpenses: '', existingLoansAmount: '',
    otherGuarantees: '', supportingOtherStudents: false,
  })
  const mutation = useMutation({
    mutationFn: () => guarantorApi.updateFinancialProfile({
      ...form,
      employmentDurationYears: form.employmentDurationYears ? Number(form.employmentDurationYears) : undefined,
      numberOfDependents: form.numberOfDependents ? Number(form.numberOfDependents) : undefined,
      monthlyExpenses: form.monthlyExpenses ? Number(form.monthlyExpenses) : undefined,
      existingLoansAmount: form.existingLoansAmount ? Number(form.existingLoansAmount) : undefined,
    }),
    onSuccess: onSaved,
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={16} className="text-navy-700" />
        <p className="text-sm font-semibold text-gray-900">Profil de Responsabilité Financière</p>
      </div>
      <p className="text-xs text-gray-500 mb-4">FORSA évalue le Case complet — étudiant, garant, et demande — pas seulement l'étudiant. Ces informations font partie de ce Case.</p>
      <div className="grid grid-cols-2 gap-3">
        <select className="input-field text-sm" value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })}>
          <option value="">Tranche de salaire</option>
          <option value="under_2000">Moins de 2 000 TND</option>
          <option value="2000_5000">2 000 – 5 000 TND</option>
          <option value="5000_10000">5 000 – 10 000 TND</option>
          <option value="over_10000">Plus de 10 000 TND</option>
        </select>
        <input className="input-field text-sm" placeholder="Source de revenu" value={form.incomeSource} onChange={e => setForm({ ...form, incomeSource: e.target.value })} />
        <input className="input-field text-sm" type="number" placeholder="Ancienneté professionnelle (années)" value={form.employmentDurationYears} onChange={e => setForm({ ...form, employmentDurationYears: e.target.value })} />
        <select className="input-field text-sm" value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
          <option value="">Situation familiale</option>
          <option value="single">Célibataire</option>
          <option value="married">Marié(e)</option>
          <option value="divorced">Divorcé(e)</option>
          <option value="widowed">Veuf/Veuve</option>
        </select>
        <input className="input-field text-sm" type="number" placeholder="Nombre de personnes à charge" value={form.numberOfDependents} onChange={e => setForm({ ...form, numberOfDependents: e.target.value })} />
        <select className="input-field text-sm" value={form.homeOwnership} onChange={e => setForm({ ...form, homeOwnership: e.target.value })}>
          <option value="">Statut du logement</option>
          <option value="owner">Propriétaire</option>
          <option value="tenant">Locataire</option>
          <option value="family_owned">Logement familial</option>
        </select>
        <input className="input-field text-sm" type="number" placeholder="Dépenses mensuelles (TND)" value={form.monthlyExpenses} onChange={e => setForm({ ...form, monthlyExpenses: e.target.value })} />
        <input className="input-field text-sm" type="number" placeholder="Prêts existants (TND)" value={form.existingLoansAmount} onChange={e => setForm({ ...form, existingLoansAmount: e.target.value })} />
      </div>
      <textarea className="input-field text-sm mt-3 w-full" placeholder="Autres garanties (optionnel)" value={form.otherGuarantees} onChange={e => setForm({ ...form, otherGuarantees: e.target.value })} />
      <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
        <input type="checkbox" checked={form.supportingOtherStudents} onChange={e => setForm({ ...form, supportingOtherStudents: e.target.checked })} />
        Je soutiens déjà un autre étudiant en tant que garant
      </label>
      {mutation.isError && <p className="text-xs text-red-500 mt-2">Une erreur est survenue. Veuillez réessayer.</p>}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="mt-4 bg-navy-800 hover:bg-navy-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Enregistrement…' : 'Enregistrer mon profil'}
      </button>
    </div>
  )
}

function CaseStatusCard({ caseStatus }: { caseStatus: any }) {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  if (!caseStatus) return null

  const rows = [
    { label: 'Profil financier', done: caseStatus.profileStatus === 'completed' },
    { label: 'Documents', done: caseStatus.documentsStatus === 'verified' },
    { label: 'Réunion', done: caseStatus.meeting?.status === 'completed' },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <p className="text-sm font-semibold text-gray-900 mb-3">Statut de mon dossier (Case)</p>
      <div className="space-y-2 mb-3">
        {rows.map(r => (
          <div key={r.label} className="flex items-center gap-2.5">
            <CheckCircle size={15} className={r.done ? 'text-teal-500' : 'text-gray-300'} />
            <span className={clsx('text-sm', r.done ? 'text-gray-800' : 'text-gray-400')}>{r.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-navy-50 rounded-xl p-3 text-sm text-navy-800 font-medium">{caseStatus.nextAction}</div>

      {caseStatus.meeting && (
        <div className="mt-3 border border-teal-100 bg-teal-50/40 rounded-xl p-3">
          <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm mb-1">
            <Calendar size={15} /> Réunion d'activation — {caseStatus.meeting.reference_number}
          </div>
          <p className="text-xs text-teal-700">
            {format(new Date(caseStatus.meeting.scheduled_at), 'dd MMM yyyy à HH:mm')} — {caseStatus.meeting.office_location}
          </p>
        </div>
      )}

      {caseStatus.profileStatus !== 'completed' && !showForm && (
        <button onClick={() => setShowForm(true)} className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700">
          Compléter mon profil financier →
        </button>
      )}
      {showForm && (
        <div className="mt-4">
          <FinancialProfileForm onSaved={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['guarantor-case'] }) }} />
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['guarantor-student'],
    queryFn: () => guarantorApi.studentSummary().then(r => r.data),
  })
  const { data: caseStatus } = useQuery({
    queryKey: ['guarantor-case'],
    queryFn: () => guarantorApi.caseStatus().then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>

  const student = data?.student
  const application = data?.application
  const schedule = data?.paymentSchedule
  const installments: any[] = data?.installments || []
  const paidCount = installments.filter(i => i.status === 'paid' || i.status === 'verified').length
  const nextDue = installments.find(i => !['paid','verified','waived'].includes(i.status))
  const lateCount = installments.filter(i => ['late','default_risk'].includes(i.status)).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tableau de bord Garant</h1>
        <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE dd MMMM yyyy')}</p>
      </div>

      {!student ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">🔗</div>
          <p className="text-sm font-medium text-amber-800">Aucun étudiant lié</p>
          <p className="text-xs text-amber-600 mt-2">Votre lien étudiant sera activé après la confirmation de l'inscription.</p>
        </div>
      ) : (
        <>
          {/* Student card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{student.first_name} {student.last_name}</h2>
                  <p className="text-xs text-gray-400">{student.email}</p>
                </div>
              </div>
              <StatusBadge status={application?.current_status || ''} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Université', value: application?.university_name || '—' },
                { label: 'Programme', value: application?.program_name || '—' },
                { label: 'Niveau', value: application?.current_status?.includes('level1') ? '🥇 Or' : application?.current_status?.includes('level2') ? '🥈 Argent' : '🥉 Bronze' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 13 (Case Management) — "Guarantor should always know:
              Invitation Status, Profile Status, Documents Remaining,
              Meeting Information." */}
          <CaseStatusCard caseStatus={caseStatus} />

          {/* Payment overview */}
          {schedule && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Mensualités payées', value: `${paidCount}/${installments.length}`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Prochaine échéance', value: nextDue ? `${Number(nextDue.amount).toLocaleString()} TND` : '—', icon: Clock, color: 'text-teal-500', bg: 'bg-teal-50' },
                { label: 'Retards', value: lateCount > 0 ? `${lateCount} mensualité(s)` : 'Aucun', icon: AlertTriangle, color: lateCount > 0 ? 'text-red-500' : 'text-gray-300', bg: lateCount > 0 ? 'bg-red-50' : 'bg-gray-50' },
                { label: 'Montant total', value: `${Number(schedule.total_amount).toLocaleString()} TND`, icon: CreditCard, color: 'text-navy-700', bg: 'bg-navy-50' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', kpi.bg)}>
                    <kpi.icon size={17} className={kpi.color} />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-400">{kpi.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Next payment CTA */}
          {nextDue && (
            <div className="bg-navy-900 rounded-2xl p-5 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-navy-300 font-medium mb-1">Prochaine mensualité</p>
                <p className="text-xl font-bold">{Number(nextDue.amount).toLocaleString()} TND</p>
                <p className="text-xs text-navy-300 mt-0.5">
                  Échéance : {nextDue.due_date ? format(new Date(nextDue.due_date), 'dd MMM yyyy') : '—'}
                  {' · Mensualité #'}{nextDue.sequence_number}
                </p>
              </div>
              <a href="/payments" className="flex-shrink-0 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                Payer →
              </a>
            </div>
          )}

          {/* Payment ledger */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900">Calendrier des paiements</p>
            </div>
            <div className="divide-y divide-gray-50">
              {installments.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Aucun calendrier de paiement disponible</div>
              ) : installments.map((inst: any) => {
                const isPaid = ['paid','verified'].includes(inst.status)
                const isLate = ['late','default_risk'].includes(inst.status)
                return (
                  <div key={inst.id} className={clsx('flex items-center justify-between px-5 py-3.5',
                    isLate ? 'bg-red-50/40' : isPaid ? 'bg-green-50/20' : '')}>
                    <div className="flex items-center gap-3">
                      <span className={clsx('text-base', isPaid ? 'text-green-500' : isLate ? 'text-red-400' : 'text-gray-300')}>
                        {isPaid ? '✓' : isLate ? '!' : '○'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inst.due_date ? format(new Date(inst.due_date), 'MMMM yyyy') : `Mensualité ${inst.sequence_number}`}
                        </p>
                        {inst.paid_at && <p className="text-xs text-green-600">Payée le {format(new Date(inst.paid_at), 'dd MMM yyyy')}</p>}
                        {isLate && <p className="text-xs text-red-500">En retard</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{Number(inst.amount).toLocaleString()} TND</p>
                      <span className={clsx('text-xs font-medium', isPaid ? 'text-green-600' : isLate ? 'text-red-500' : 'text-gray-400')}>
                        {isPaid ? 'Payée' : isLate ? 'En retard' : 'En attente'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* FORSA contact */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Des questions ?</p>
            <p className="text-xs text-gray-500">Contactez l'équipe FORSA directement.</p>
            <a href="mailto:hello@forsa.tn" className="text-sm font-semibold text-teal-600 hover:text-teal-700 mt-2 inline-block">hello@forsa.tn</a>
          </div>
        </>
      )}
    </div>
  )
}
