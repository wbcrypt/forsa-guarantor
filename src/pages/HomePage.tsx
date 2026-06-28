import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../hooks/useLocale'
import { studentApi, paymentApi } from '../lib/api'
import { StatusBadge, Card, SkeletonCard, EmptyState } from '../components/ui'
import {
  FileText, Upload, CreditCard, ChevronRight, Star,
  CheckCircle, Clock, AlertTriangle, Bell
} from 'lucide-react'
import { format } from 'date-fns'

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useLocale()

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student-me', user?.id],
    queryFn: () => studentApi.getMe(user!.id).then(r => r.data),
    enabled: !!user?.id,
  })

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['student-apps', user?.id],
    queryFn: () => studentApi.getApplications(user!.id).then(r => r.data),
    enabled: !!user?.id,
  })

  const { data: score } = useQuery({
    queryKey: ['student-score', user?.id],
    queryFn: () => studentApi.getScore(user!.id).then(r => r.data),
    enabled: !!user?.id,
  })

  const firstName = student?.first_name || user?.email?.split('@')[0] || 'Student'
  const latestApp = applications?.[0]
  const aggregateScore = score?.aggregate_score || student?.aggregate_score

  const getStatusIcon = (status: string) => {
    if (['approved_level1', 'approved_level2', 'approved_level3', 'active_student'].includes(status))
      return <CheckCircle size={16} className="text-green-500" />
    if (['rejected'].includes(status))
      return <AlertTriangle size={16} className="text-red-500" />
    return <Clock size={16} className="text-amber-500" />
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{t('hello')},</p>
          <h1 className="text-2xl font-bold text-gray-900">{firstName} 👋</h1>
        </div>
        {aggregateScore && (
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('scoreLabel')}</p>
            <p className="text-2xl font-bold text-teal-600">{aggregateScore}</p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-400 capitalize">{score?.score_band?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Application status card */}
      {appsLoading ? <SkeletonCard /> : latestApp ? (
        <Link to={`/application/${latestApp.id}`}>
          <Card className="border-2 border-navy-100 hover:border-navy-300 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t('yourApplication')}</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">
                  {latestApp.university_name || 'University'}
                </p>
                <p className="text-sm text-gray-500">{latestApp.program_name || 'Program'} · {latestApp.academic_year}</p>
              </div>
              <StatusBadge status={latestApp.current_status} />
            </div>

            {/* Status timeline mini */}
            <div className="flex items-center gap-1.5 mb-4">
              {[
                { s: 'new_lead', label: 'Received' },
                { s: 'under_review', label: 'Review' },
                { s: 'approved_level2', label: 'Decision' },
                { s: 'active_student', label: 'Active' },
              ].map((stage, i) => {
                const statuses = ['new_lead', 'contacted', 'waiting_for_documents', 'documents_received', 'under_review', 'approved_level1', 'approved_level2', 'approved_level3', 'contract_sent', 'contract_signed', 'active_student', 'completed']
                const currentIdx = statuses.indexOf(latestApp.current_status)
                const stageIdx = statuses.indexOf(stage.s)
                const done = currentIdx >= stageIdx
                return (
                  <div key={stage.s} className="flex items-center flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-teal-500' : 'bg-gray-200'}`} />
                    {i < 3 && <div className={`flex-1 h-0.5 ${done ? 'bg-teal-500' : 'bg-gray-200'}`} />}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {parseFloat(latestApp.tuition_amount || '0').toLocaleString()} {latestApp.currency || 'TND'}
              </p>
              <span className="text-xs text-navy-700 font-medium flex items-center gap-1">
                {t('checkStatus')} <ChevronRight size={14} />
              </span>
            </div>
          </Card>
        </Link>
      ) : (
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText size={22} className="text-navy-600" />
            </div>
            <p className="font-semibold text-gray-900">{t('noApplicationYet')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('applyToGetStarted')}</p>
            <Link to="/apply" className="btn-teal mt-4 text-sm">
              {t('applyNow')}
            </Link>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Upload, label: t('documents'), path: '/documents', color: 'bg-blue-50 text-blue-600' },
          { icon: CreditCard, label: t('payments'), path: '/payments', color: 'bg-green-50 text-green-600' },
          { icon: Bell, label: t('notifications'), path: '/notifications', color: 'bg-purple-50 text-purple-600' },
        ].map(action => {
          const Icon = action.icon
          return (
            <Link key={action.path} to={action.path}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-all active:scale-95">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Recent payments */}
      {latestApp && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">{t('paymentSchedule')}</h2>
            <Link to="/payments" className="text-xs text-teal-600 font-medium flex items-center gap-1">
              {t('viewAll')} <ChevronRight size={12} />
            </Link>
          </div>
          <RecentPayments applicationId={latestApp.id} />
        </div>
      )}
    </div>
  )
}

function RecentPayments({ applicationId }: { applicationId: string }) {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', applicationId],
    queryFn: () => paymentApi.getSchedule(applicationId).then(r => r.data),
  })

  if (isLoading) return <SkeletonCard />
  if (!schedule) return null

  const installments = (schedule.installments || []).slice(0, 3)

  return (
    <Card padding={false}>
      {installments.map((inst: any, i: number) => (
        <div key={inst.id}
          className={`flex items-center justify-between px-4 py-3 ${i < installments.length - 1 ? 'border-b border-gray-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
              inst.status === 'paid' ? 'bg-green-50 text-green-600' :
              inst.status === 'late' ? 'bg-red-50 text-red-600' :
              'bg-gray-100 text-gray-500'
            }`}>
              {inst.sequence_number || inst.sequence}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {parseFloat(inst.amount).toLocaleString()} {schedule.currency}
              </p>
              <p className="text-xs text-gray-400">
                {inst.due_date ? format(new Date(inst.due_date), 'dd MMM yyyy') : '—'}
              </p>
            </div>
          </div>
          <StatusBadge status={inst.status} />
        </div>
      ))}
    </Card>
  )
}
