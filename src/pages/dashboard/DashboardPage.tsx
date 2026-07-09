import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guarantorApi } from '../../lib/api'
import { useLocale } from '../../hooks/useLocale'
import { format } from 'date-fns'
import { CheckCircle, Clock, AlertTriangle, CreditCard, ClipboardList, Calendar } from 'lucide-react'
import clsx from 'clsx'

// QA-9 fix — this map only ever covered a handful of status strings
// ('applied', 'pre_approved', 'contracts_signed', 'activation_meeting')
// that don't actually exist anywhere in the real ApplicationStatus enum
// (applications.service.ts / common/enums) — every genuine status
// (new_lead, contacted, under_review, approved_levelN, contract_signed,
// university_confirmed, etc.) fell through to the raw, untranslated
// fallback `{status}`. Now covers every real enum value, in the same
// plain-language spirit as the Student Timeline (application-stages.util.ts)
// rather than exposing internal CRM vocabulary to the guarantor.
const STATUS_STYLES: Record<string, string> = {
  new_lead: 'bg-blue-50 text-blue-700', contacted: 'bg-blue-50 text-blue-700',
  waiting_for_documents: 'bg-amber-50 text-amber-700', documents_received: 'bg-blue-50 text-blue-700',
  under_review: 'bg-blue-50 text-blue-700', more_info_required: 'bg-amber-50 text-amber-700',
  on_hold: 'bg-amber-50 text-amber-700', capital_queue: 'bg-amber-50 text-amber-700', appealing: 'bg-amber-50 text-amber-700',
  approved_level1: 'bg-teal-50 text-teal-700', approved_level2: 'bg-teal-50 text-teal-700', approved_level3: 'bg-teal-50 text-teal-700',
  rejected: 'bg-amber-50 text-amber-700', fraud_flagged: 'bg-red-50 text-red-700',
  contract_sent: 'bg-purple-50 text-purple-700', contract_signed: 'bg-purple-50 text-purple-700',
  university_confirmed: 'bg-purple-50 text-purple-700', university_paid: 'bg-purple-50 text-purple-700',
  active_student: 'bg-green-50 text-green-700', completed: 'bg-green-50 text-green-700', withdrawn: 'bg-gray-100 text-gray-500',
}
const STATUS_LABELS: Record<'fr' | 'en' | 'ar', Record<string, string>> = {
  fr: {
    new_lead: 'Candidature soumise', contacted: 'Candidature soumise',
    waiting_for_documents: 'En attente', documents_received: "En cours d'examen",
    under_review: "En cours d'examen", more_info_required: 'Informations complémentaires requises',
    on_hold: 'En pause', capital_queue: "Liste d'attente", appealing: 'En appel',
    approved_level1: 'Approuvé', approved_level2: 'Approuvé', approved_level3: 'Approuvé',
    rejected: 'Non approuvé', fraud_flagged: 'Signalé',
    contract_sent: 'Contrat envoyé', contract_signed: 'Contrat signé',
    university_confirmed: "Confirmé par l'université", university_paid: 'Paiement effectué',
    active_student: 'Étudiant actif', completed: 'Terminé', withdrawn: 'Retiré',
  },
  en: {
    new_lead: 'Application submitted', contacted: 'Application submitted',
    waiting_for_documents: 'Waiting', documents_received: 'Under review',
    under_review: 'Under review', more_info_required: 'More information required',
    on_hold: 'On hold', capital_queue: 'Waiting list', appealing: 'Under appeal',
    approved_level1: 'Approved', approved_level2: 'Approved', approved_level3: 'Approved',
    rejected: 'Not approved', fraud_flagged: 'Flagged',
    contract_sent: 'Contract sent', contract_signed: 'Contract signed',
    university_confirmed: 'Confirmed by university', university_paid: 'Payment made',
    active_student: 'Active student', completed: 'Completed', withdrawn: 'Withdrawn',
  },
  ar: {
    new_lead: 'تم تقديم الطلب', contacted: 'تم تقديم الطلب',
    waiting_for_documents: 'قيد الانتظار', documents_received: 'قيد المراجعة',
    under_review: 'قيد المراجعة', more_info_required: 'معلومات إضافية مطلوبة',
    on_hold: 'معلّق', capital_queue: 'قائمة الانتظار', appealing: 'قيد الاستئناف',
    approved_level1: 'موافق عليه', approved_level2: 'موافق عليه', approved_level3: 'موافق عليه',
    rejected: 'غير موافق عليه', fraud_flagged: 'تم الإبلاغ عنه',
    contract_sent: 'تم إرسال العقد', contract_signed: 'تم توقيع العقد',
    university_confirmed: 'أكدته الجامعة', university_paid: 'تم الدفع',
    active_student: 'طالب نشط', completed: 'مكتمل', withdrawn: 'مسحوب',
  },
}

function StatusBadge({ status }: { status: string }) {
  const { locale } = useLocale()
  // Found alongside the "no linked student until an application exists"
  // bug: a linked student with no application yet passed an empty string
  // here, rendering a blank grey pill with no visible text.
  if (!status) {
    const noAppText = locale === 'ar' ? 'لا يوجد طلب بعد' : locale === 'en' ? 'No application yet' : 'Pas encore de demande'
    return <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">{noAppText}</span>
  }
  const labels = STATUS_LABELS[locale] || STATUS_LABELS.fr
  return <span className={clsx('text-xs font-semibold px-3 py-1 rounded-full', STATUS_STYLES[status] || 'bg-gray-100 text-gray-600')}>{labels[status] || status}</span>
}

function FinancialProfileForm({ onSaved }: { onSaved: () => void }) {
  const { t, locale } = useLocale()
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
    <div className="bg-white border border-gray-100 rounded-2xl p-5" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={16} className="text-navy-700" />
        <p className="text-sm font-semibold text-gray-900">{t('financialResponsibilityProfile')}</p>
      </div>
      <p className="text-xs text-gray-500 mb-4">{t('financialProfileIntro')}</p>
      <div className="grid grid-cols-2 gap-3">
        <select className="input-field text-sm" value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })}>
          <option value="">{t('salaryRangeLabel')}</option>
          <option value="under_2000">{t('salaryUnder2000')}</option>
          <option value="2000_5000">{t('salary2000to5000')}</option>
          <option value="5000_10000">{t('salary5000to10000')}</option>
          <option value="over_10000">{t('salaryOver10000')}</option>
        </select>
        <input className="input-field text-sm" placeholder={t('incomeSourceLabel')} value={form.incomeSource} onChange={e => setForm({ ...form, incomeSource: e.target.value })} />
        <input className="input-field text-sm" type="number" placeholder={t('employmentDurationLabel')} value={form.employmentDurationYears} onChange={e => setForm({ ...form, employmentDurationYears: e.target.value })} />
        <select className="input-field text-sm" value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
          <option value="">{t('maritalStatusLabel')}</option>
          <option value="single">{t('maritalSingle')}</option>
          <option value="married">{t('maritalMarried')}</option>
          <option value="divorced">{t('maritalDivorced')}</option>
          <option value="widowed">{t('maritalWidowed')}</option>
        </select>
        <input className="input-field text-sm" type="number" placeholder={t('dependentsLabel')} value={form.numberOfDependents} onChange={e => setForm({ ...form, numberOfDependents: e.target.value })} />
        <select className="input-field text-sm" value={form.homeOwnership} onChange={e => setForm({ ...form, homeOwnership: e.target.value })}>
          <option value="">{t('homeOwnershipLabel')}</option>
          <option value="owner">{t('ownerLabel')}</option>
          <option value="tenant">{t('tenantLabel')}</option>
          <option value="family_owned">{t('familyOwnedLabel')}</option>
        </select>
        <input className="input-field text-sm" type="number" placeholder={t('monthlyExpensesLabel')} value={form.monthlyExpenses} onChange={e => setForm({ ...form, monthlyExpenses: e.target.value })} />
        <input className="input-field text-sm" type="number" placeholder={t('existingLoansLabel')} value={form.existingLoansAmount} onChange={e => setForm({ ...form, existingLoansAmount: e.target.value })} />
      </div>
      <textarea className="input-field text-sm mt-3 w-full" placeholder={t('otherGuaranteesLabel')} value={form.otherGuarantees} onChange={e => setForm({ ...form, otherGuarantees: e.target.value })} />
      <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
        <input type="checkbox" checked={form.supportingOtherStudents} onChange={e => setForm({ ...form, supportingOtherStudents: e.target.checked })} />
        {t('supportingOtherStudentsLabel')}
      </label>
      {mutation.isError && <p className="text-xs text-red-500 mt-2">{locale === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : locale === 'fr' ? 'Une erreur est survenue. Veuillez réessayer.' : 'Something went wrong. Please try again.'}</p>}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="mt-4 bg-navy-800 hover:bg-navy-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? t('savingProfile') : t('saveProfile')}
      </button>
    </div>
  )
}

function CaseStatusCard({ caseStatus }: { caseStatus: any }) {
  const { t, locale } = useLocale()
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  if (!caseStatus) return null

  // Phase 14 — "No document upload during the application. Documents are
  // verified physically during the meeting." No separate Documents
  // checkpoint anymore — CIN/income proof/كمبيالة are verified in person
  // as part of the meeting itself.
  const rows = [
    { label: t('financialProfileLabel'), done: caseStatus.profileStatus === 'completed' },
    { label: t('meetingLabel'), done: caseStatus.meeting?.status === 'completed' },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <p className="text-sm font-semibold text-gray-900 mb-3">{t('caseStatusTitle')}</p>
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
            <Calendar size={15} /> {t('meetingReference')} — {caseStatus.meeting.reference_number}
          </div>
          {/* QA-4 fix — explicit Africa/Tunis rather than date-fns'
              format() using the browser's own local timezone, so this
              always matches the meeting email regardless of the
              viewer's device timezone. */}
          <p className="text-xs text-teal-700">
            {new Date(caseStatus.meeting.scheduled_at).toLocaleString('fr-TN', { timeZone: 'Africa/Tunis', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — {caseStatus.meeting.office_location}
          </p>
        </div>
      )}

      {caseStatus.profileStatus !== 'completed' && !showForm && (
        <button onClick={() => setShowForm(true)} className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700">
          {t('completeMyFinancialProfile')} →
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
