import { useQuery } from '@tanstack/react-query'
import { guarantorApi } from '../../lib/api'
import { format } from 'date-fns'
import { CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'
import clsx from 'clsx'

function StatusBadge({ status }: { status: string }) {
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
    rejected: 'Membre Bronze', internal_review: "En cours d'examen",
    activation_meeting: "Réunion d'activation",
  }
  return <span className={clsx('text-xs font-semibold px-3 py-1 rounded-full', cfg[status] || 'bg-gray-100 text-gray-600')}>{labels[status] || status}</span>
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['guarantor-student'],
    queryFn: () => guarantorApi.studentSummary().then(r => r.data),
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
