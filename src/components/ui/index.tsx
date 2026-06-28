import React from 'react'
import clsx from 'clsx'
import { AlertCircle, CheckCircle, X, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react'

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusMap: Record<string, { color: string; label: string }> = {
  new_lead: { color: 'bg-gray-100 text-gray-600', label: 'Received' },
  contacted: { color: 'bg-blue-50 text-blue-600', label: 'Contacted' },
  waiting_for_documents: { color: 'bg-amber-50 text-amber-700', label: 'Documents Required' },
  documents_received: { color: 'bg-blue-50 text-blue-700', label: 'Docs Received' },
  under_review: { color: 'bg-purple-50 text-purple-700', label: 'Under Review' },
  approved_level1: { color: 'bg-green-50 text-green-700', label: 'Approved ✓' },
  approved_level2: { color: 'bg-green-50 text-green-700', label: 'Approved ✓' },
  approved_level3: { color: 'bg-teal-50 text-teal-700', label: 'Referred' },
  rejected: { color: 'bg-amber-50 text-amber-700', label: 'Bronze Member' },
  on_hold: { color: 'bg-orange-50 text-orange-600', label: 'On Hold' },
  contract_sent: { color: 'bg-indigo-50 text-indigo-600', label: 'Contract Sent' },
  contract_signed: { color: 'bg-indigo-50 text-indigo-700', label: 'Contract Signed' },
  active_student: { color: 'bg-teal-50 text-teal-700', label: 'Active' },
  completed: { color: 'bg-gray-100 text-gray-600', label: 'Completed' },
  paid: { color: 'bg-green-50 text-green-700', label: 'Paid' },
  pending: { color: 'bg-amber-50 text-amber-700', label: 'Pending' },
  late: { color: 'bg-red-50 text-red-600', label: 'Late' },
  verified: { color: 'bg-green-50 text-green-700', label: 'Verified' },
  uploaded: { color: 'bg-blue-50 text-blue-600', label: 'Uploaded' },
  absent: { color: 'bg-gray-100 text-gray-500', label: 'Missing' },
  under_review_doc: { color: 'bg-purple-50 text-purple-600', label: 'Under Review' },
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const s = statusMap[status] || { color: 'bg-gray-100 text-gray-600', label: status }
  return (
    <span className={clsx('badge', s.color)}>
      {label || s.label}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, padding = true }: {
  children: React.ReactNode; className?: string; padding?: boolean
}) {
  return <div className={clsx('card', padding && 'p-5', className)}>{children}</div>
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', message, onClose }: {
  type?: 'success' | 'error' | 'info' | 'warning'; message: string; onClose?: () => void
}) {
  const styles = {
    success: { bg: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle },
    error: { bg: 'bg-red-50 border-red-200 text-red-800', Icon: AlertCircle },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', Icon: AlertCircle },
    info: { bg: 'bg-blue-50 border-blue-200 text-blue-800', Icon: Info },
  }
  const { bg, Icon } = styles[type]
  return (
    <div className={clsx('flex items-start gap-3 p-4 rounded-xl border text-sm mb-4', bg)}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>}
    </div>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2 size={24} className="text-navy-800 animate-spin" />
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: React.ElementType; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <p className="text-base font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── FormField ────────────────────────────────────────────────────────────────
export function FormField({ label, error, required, hint, children }: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Step Progress ────────────────────────────────────────────────────────────
export function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
              i < current ? 'bg-teal-500 text-white' :
              i === current ? 'bg-navy-800 text-white' :
              'bg-gray-100 text-gray-400'
            )}>
              {i < current ? <CheckCircle size={14} /> : i + 1}
            </div>
            <p className={clsx(
              'text-xs mt-1 hidden sm:block',
              i === current ? 'text-navy-800 font-medium' : 'text-gray-400'
            )}>{step}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={clsx(
              'flex-1 h-0.5 mx-2 mb-4 transition-all',
              i < current ? 'bg-teal-500' : 'bg-gray-200'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-6 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  )
}
