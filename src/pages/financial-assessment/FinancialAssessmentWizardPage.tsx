import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ShieldAlert, FileText } from 'lucide-react'
import clsx from 'clsx'
import { StepProgress, Card, Alert, FormField, EmptyState, Spinner } from '../../components/ui'
import { useLocale } from '../../hooks/useLocale'
import { financialAssessmentApi } from '../../lib/api'
import {
  RELATIONSHIP_LABELS, GOVERNORATE_LABELS, EMPLOYMENT_STATUS_LABELS, EMPLOYMENT_TYPE_LABELS,
  ADDITIONAL_INCOME_TYPE_LABELS, CHECKLIST_LABELS, pickLabel,
} from './labels'

interface FormState {
  fullName: string; cinNumber: string; relationship: string; dateOfBirth: string; phoneNumber: string; governorate: string
  employmentStatus: string; employerName: string; jobTitle: string; yearsWithEmployer: string; employmentType: string
  monthlyNetIncome: string; additionalIncomeType: string; additionalIncomeAmount: string
  monthlyLoanPayments: string; hasPreviousUnpaidInstallments: boolean | undefined
  bankName: string; hasReturnedCheque: boolean | undefined; hasSalarySeizure: boolean | undefined; hasFrequentOverdraft: boolean | undefined
  approximateSavings: string
}

const EMPTY_FORM: FormState = {
  fullName: '', cinNumber: '', relationship: '', dateOfBirth: '', phoneNumber: '', governorate: '',
  employmentStatus: '', employerName: '', jobTitle: '', yearsWithEmployer: '', employmentType: '',
  monthlyNetIncome: '', additionalIncomeType: '', additionalIncomeAmount: '',
  monthlyLoanPayments: '', hasPreviousUnpaidInstallments: undefined,
  bankName: '', hasReturnedCheque: undefined, hasSalarySeizure: undefined, hasFrequentOverdraft: undefined,
  approximateSavings: '',
}

function hydrate(row: any): FormState {
  if (!row) return EMPTY_FORM
  return {
    fullName: row.full_name || '', cinNumber: row.cinNumber || '', relationship: row.relationship || '',
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : '', phoneNumber: row.phone_number || '', governorate: row.governorate || '',
    employmentStatus: row.employment_status || '', employerName: row.employer_name || '', jobTitle: row.job_title || '',
    yearsWithEmployer: row.years_with_employer != null ? String(row.years_with_employer) : '', employmentType: row.employment_type || '',
    monthlyNetIncome: row.monthly_net_income != null ? String(row.monthly_net_income) : '',
    additionalIncomeType: row.additional_income_type || '', additionalIncomeAmount: row.additional_income_amount != null ? String(row.additional_income_amount) : '',
    monthlyLoanPayments: row.monthly_loan_payments != null ? String(row.monthly_loan_payments) : '',
    hasPreviousUnpaidInstallments: row.has_previous_unpaid_installments ?? undefined,
    bankName: row.bank_name || '', hasReturnedCheque: row.has_returned_cheque ?? undefined,
    hasSalarySeizure: row.has_salary_seizure ?? undefined, hasFrequentOverdraft: row.has_frequent_overdraft ?? undefined,
    approximateSavings: row.approximate_savings != null ? String(row.approximate_savings) : '',
  }
}

function toPayload(f: Partial<FormState>) {
  const num = (v?: string) => (v === undefined || v === '' ? undefined : Number(v))
  return {
    fullName: f.fullName || undefined, cinNumber: f.cinNumber || undefined, relationship: f.relationship || undefined,
    dateOfBirth: f.dateOfBirth || undefined, phoneNumber: f.phoneNumber || undefined, governorate: f.governorate || undefined,
    employmentStatus: f.employmentStatus || undefined, employerName: f.employerName || undefined, jobTitle: f.jobTitle || undefined,
    yearsWithEmployer: num(f.yearsWithEmployer), employmentType: f.employmentType || undefined,
    monthlyNetIncome: num(f.monthlyNetIncome), additionalIncomeType: f.additionalIncomeType || undefined, additionalIncomeAmount: num(f.additionalIncomeAmount),
    monthlyLoanPayments: num(f.monthlyLoanPayments), hasPreviousUnpaidInstallments: f.hasPreviousUnpaidInstallments,
    bankName: f.bankName || undefined, hasReturnedCheque: f.hasReturnedCheque, hasSalarySeizure: f.hasSalarySeizure, hasFrequentOverdraft: f.hasFrequentOverdraft,
    approximateSavings: num(f.approximateSavings),
  }
}

function Text({ value, onChange, type = 'text' }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
}

function Select({ value, onChange, options, locale, placeholder }: {
  value: string; onChange: (v: string) => void; options: Record<string, { en: string; fr: string; ar: string }>
  locale: 'en' | 'fr' | 'ar'; placeholder: string
}) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {Object.keys(options).map((code) => (
        <option key={code} value={code}>{pickLabel(options, code, locale)}</option>
      ))}
    </select>
  )
}

function BooleanToggle({ value, onChange, yesLabel, noLabel }: {
  value: boolean | undefined; onChange: (v: boolean) => void; yesLabel: string; noLabel: string
}) {
  return (
    <div className="flex gap-2">
      {[{ v: true, label: yesLabel }, { v: false, label: noLabel }].map((opt) => (
        <button
          key={String(opt.v)}
          type="button"
          onClick={() => onChange(opt.v)}
          className={clsx(
            'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all',
            value === opt.v ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function FinancialAssessmentWizardPage() {
  const { t, locale } = useLocale()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [confirmed, setConfirmed] = useState(false)
  const [stepError, setStepError] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['financial-assessment-mine'],
    queryFn: () => financialAssessmentApi.getMine().then((r) => r.data),
  })

  useEffect(() => {
    if (data?.assessment && !hydrated) {
      setForm(hydrate(data.assessment))
      setHydrated(true)
    }
  }, [data, hydrated])

  const saveDraftMutation = useMutation({
    mutationFn: (payload: any) => financialAssessmentApi.saveDraft(payload),
  })
  const submitMutation = useMutation({
    mutationFn: (payload: any) => financialAssessmentApi.submit(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial-assessment-mine'] }),
  })

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const STEP_LABELS = [t('faStepIdentity'), t('faStepEmployment'), t('faStepIncome'), t('faStepCommitments'), t('faStepBanking'), t('faStepSavings'), t('faStepConfirm')]

  const stepValid = useMemo(() => {
    switch (step) {
      case 0: return !!(form.fullName && form.cinNumber && form.relationship && form.dateOfBirth && form.phoneNumber && form.governorate)
      case 1: return !!(form.employmentStatus && form.employmentType)
      case 2: return !!form.monthlyNetIncome
      case 3: return form.monthlyLoanPayments !== '' && form.hasPreviousUnpaidInstallments !== undefined
      case 4: return !!form.bankName && form.hasReturnedCheque !== undefined && form.hasSalarySeizure !== undefined && form.hasFrequentOverdraft !== undefined
      case 5: return form.approximateSavings !== ''
      case 6: return confirmed
      default: return false
    }
  }, [step, form, confirmed])

  const goNext = async () => {
    if (!stepValid) { setStepError(true); return }
    setStepError(false)
    if (step < 5) {
      await saveDraftMutation.mutateAsync(toPayload(form))
      setStep((s) => s + 1)
    } else if (step === 5) {
      await saveDraftMutation.mutateAsync(toPayload(form))
      setStep(6)
    } else {
      submitMutation.mutate({ ...toPayload(form), confirmed: true })
    }
  }
  const goBack = () => { setStepError(false); setStep((s) => Math.max(0, s - 1)) }

  if (isLoading) return <div className="py-16"><Spinner /></div>

  if (isError && (error as any)?.response?.status === 404) {
    return (
      <EmptyState icon={ShieldAlert} title={t('faNoApplicationTitle')} description={t('faNoApplicationBody')}
        action={<button className="btn-secondary" onClick={() => navigate('/')}>{t('faBackToDashboard')}</button>} />
    )
  }

  const submitted = data?.assessment?.status === 'submitted'
  if (submitted || submitMutation.isSuccess) {
    const checklist: any[] = submitMutation.data?.data?.checklist || data?.checklist || []
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={30} className="text-teal-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">{t('faSubmittedTitle')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('faSubmittedBody')}</p>
        </div>
        <Card className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-navy-700" />
            <p className="text-sm font-semibold text-gray-900">{t('faChecklistTitle')}</p>
          </div>
          <ul className="space-y-2">
            {checklist.filter((item) => item.applicable !== false).map((item) => (
              <li key={item.code} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-teal-500 mt-0.5">•</span>
                {pickLabel(CHECKLIST_LABELS, item.code, locale)}
              </li>
            ))}
          </ul>
        </Card>
        <button className="btn-primary w-full mt-6" onClick={() => navigate('/')}>{t('faBackToDashboard')}</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-900">{t('faTitle')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('faSubtitle')}</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <StepProgress steps={STEP_LABELS} current={step} />
      </div>

      {stepError && <Alert type="error" message={t('faRequiredFieldsError')} onClose={() => setStepError(false)} />}

      <Card className="space-y-4">
        {step === 0 && (
          <>
            <FormField label={t('faFullName')} required><Text value={form.fullName} onChange={(v) => update({ fullName: v })} /></FormField>
            <FormField label={t('faCinNumber')} required><Text value={form.cinNumber} onChange={(v) => update({ cinNumber: v })} /></FormField>
            <FormField label={t('faRelationship')} required>
              <Select value={form.relationship} onChange={(v) => update({ relationship: v })} options={RELATIONSHIP_LABELS} locale={locale} placeholder={t('faSelectPlaceholder')} />
            </FormField>
            <FormField label={t('faDateOfBirth')} required><Text type="date" value={form.dateOfBirth} onChange={(v) => update({ dateOfBirth: v })} /></FormField>
            <FormField label={t('faPhoneNumber')} required><Text type="tel" value={form.phoneNumber} onChange={(v) => update({ phoneNumber: v })} /></FormField>
            <FormField label={t('faGovernorate')} required>
              <Select value={form.governorate} onChange={(v) => update({ governorate: v })} options={GOVERNORATE_LABELS} locale={locale} placeholder={t('faSelectPlaceholder')} />
            </FormField>
          </>
        )}

        {step === 1 && (
          <>
            <FormField label={t('faEmploymentStatus')} required>
              <Select value={form.employmentStatus} onChange={(v) => update({ employmentStatus: v })} options={EMPLOYMENT_STATUS_LABELS} locale={locale} placeholder={t('faSelectPlaceholder')} />
            </FormField>
            <FormField label={t('faEmployerName')}><Text value={form.employerName} onChange={(v) => update({ employerName: v })} /></FormField>
            <FormField label={t('faJobTitle')}><Text value={form.jobTitle} onChange={(v) => update({ jobTitle: v })} /></FormField>
            <FormField label={t('faYearsWithEmployer')}><Text type="number" value={form.yearsWithEmployer} onChange={(v) => update({ yearsWithEmployer: v })} /></FormField>
            <FormField label={t('faEmploymentType')} required>
              <Select value={form.employmentType} onChange={(v) => update({ employmentType: v })} options={EMPLOYMENT_TYPE_LABELS} locale={locale} placeholder={t('faSelectPlaceholder')} />
            </FormField>
          </>
        )}

        {step === 2 && (
          <>
            <FormField label={t('faMonthlyNetIncome')} required><Text type="number" value={form.monthlyNetIncome} onChange={(v) => update({ monthlyNetIncome: v })} /></FormField>
            <FormField label={t('faAdditionalIncomeType')}>
              <Select value={form.additionalIncomeType} onChange={(v) => update({ additionalIncomeType: v })} options={ADDITIONAL_INCOME_TYPE_LABELS} locale={locale} placeholder={t('faSelectPlaceholder')} />
            </FormField>
            <FormField label={t('faAdditionalIncomeAmount')}><Text type="number" value={form.additionalIncomeAmount} onChange={(v) => update({ additionalIncomeAmount: v })} /></FormField>
          </>
        )}

        {step === 3 && (
          <>
            <FormField label={t('faMonthlyLoanPayments')} required hint="0 if none"><Text type="number" value={form.monthlyLoanPayments} onChange={(v) => update({ monthlyLoanPayments: v })} /></FormField>
            <FormField label={t('faHasPreviousUnpaidInstallments')} required>
              <BooleanToggle value={form.hasPreviousUnpaidInstallments} onChange={(v) => update({ hasPreviousUnpaidInstallments: v })} yesLabel={t('faYes')} noLabel={t('faNo')} />
            </FormField>
          </>
        )}

        {step === 4 && (
          <>
            <FormField label={t('faBankName')} required><Text value={form.bankName} onChange={(v) => update({ bankName: v })} /></FormField>
            <FormField label={t('faHasReturnedCheque')} required>
              <BooleanToggle value={form.hasReturnedCheque} onChange={(v) => update({ hasReturnedCheque: v })} yesLabel={t('faYes')} noLabel={t('faNo')} />
            </FormField>
            <FormField label={t('faHasSalarySeizure')} required>
              <BooleanToggle value={form.hasSalarySeizure} onChange={(v) => update({ hasSalarySeizure: v })} yesLabel={t('faYes')} noLabel={t('faNo')} />
            </FormField>
            <FormField label={t('faHasFrequentOverdraft')} required>
              <BooleanToggle value={form.hasFrequentOverdraft} onChange={(v) => update({ hasFrequentOverdraft: v })} yesLabel={t('faYes')} noLabel={t('faNo')} />
            </FormField>
          </>
        )}

        {step === 5 && (
          <FormField label={t('faApproximateSavings')} required hint="0 if none">
            <Text type="number" value={form.approximateSavings} onChange={(v) => update({ approximateSavings: v })} />
          </FormField>
        )}

        {step === 6 && (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-4">
              <p className="font-semibold mb-1">{t('faConfirmTitle')}</p>
              <p>{t('faConfirmBody')}</p>
            </div>
            <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              {t('faConfirmCheckbox')}
            </label>
            {submitMutation.isError && <Alert type="error" message={(submitMutation.error as any)?.response?.data?.message || t('errorTitle')} />}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between mt-6 gap-3">
        <button className="btn-secondary" onClick={goBack} disabled={step === 0}>{t('back')}</button>
        <button
          className="btn-primary flex-1"
          onClick={goNext}
          disabled={saveDraftMutation.isPending || submitMutation.isPending}
        >
          {step === 6
            ? (submitMutation.isPending ? t('faSubmitting') : t('faSubmit'))
            : t('next')}
        </button>
      </div>
    </div>
  )
}
