import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocale } from '../../hooks/useLocale'
import { LOCALES, Locale } from '../../lib/i18n'
import { Alert, FormField, StepProgress } from '../../components/ui'
import { Loader2, Eye, EyeOff, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

interface RegForm {
  firstName: string; lastName: string; email: string; phone: string
  password: string; confirmPassword: string; agreed: boolean
  dateOfBirth: string; nationality: string; city: string; academicLevel: string
}

const STEPS = ['Account', 'Personal', 'Confirm']

function validate(form: RegForm, step: number): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 0) {
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
  }
  if (step === 1) {
    if (!form.city.trim()) e.city = 'Required'
  }
  return e
}

export default function RegisterPage() {
  const { t, locale, changeLocale } = useLocale()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<RegForm>({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', agreed: false,
    dateOfBirth: '', nationality: 'TN', city: '', academicLevel: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const set = (field: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const next = () => {
    const errs = validate(form, step)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStep(s => s + 1)
  }

  const submit = async () => {
    if (!form.agreed) { setErrors({ agreed: 'You must agree to continue' }); return }
    setLoading(true); setServerError('')
    try {
      // Create student account via the students endpoint
      await api.post('/students', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phonePrimary: form.phone,
        dateOfBirth: form.dateOfBirth || undefined,
        nationality: form.nationality,
        city: form.city,
        academicLevel: form.academicLevel || undefined,
      })
      // Auto-login — note: in production this would be a separate student auth endpoint
      // For now we try login with the submitted credentials
      await login(form.email, form.password)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setServerError(msg || 'Registration failed. This email may already be registered.')
      setStep(0)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-white font-semibold">FORSA</span>
        </div>
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {LOCALES.map(l => (
            <button key={l.code} onClick={() => changeLocale(l.code as Locale)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                locale === l.code ? 'bg-white text-navy-900' : 'text-white/70 hover:text-white'
              }`}>
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-white text-2xl font-bold">{t('createAccount')}</h1>
            <p className="text-white/60 text-sm mt-1">{t('createAccountSubtitle')}</p>
          </div>

          {/* Step progress */}
          <div className="mb-6 px-4">
            <StepProgress steps={STEPS} current={step} />
          </div>

          <div className="bg-white rounded-2xl shadow-modal p-6">
            {serverError && <Alert type="error" message={serverError} onClose={() => setServerError('')} />}

            {/* Step 0 — Account */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t('firstName')} required error={errors.firstName}>
                    <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Mohamed" />
                  </FormField>
                  <FormField label={t('lastName')} required error={errors.lastName}>
                    <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Ben Ali" />
                  </FormField>
                </div>
                <FormField label={t('emailAddress')} required error={errors.email}>
                  <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@email.com" />
                </FormField>
                <FormField label={t('phone')} error={errors.phone}>
                  <input className="input" value={form.phone} onChange={set('phone')} placeholder="+216 20 000 000" />
                </FormField>
                <FormField label={t('password')} required error={errors.password} hint={locale === 'ar' ? '8 أحرف على الأقل' : locale === 'fr' ? 'Au moins 8 caractères' : 'At least 8 characters'}>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} className="input pr-11"
                      value={form.password} onChange={set('password')} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>
                <FormField label={t('confirmPassword')} required error={errors.confirmPassword}>
                  <input type={showPw ? 'text' : 'password'} className="input"
                    value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" />
                </FormField>
                <button onClick={next} className="btn-primary w-full py-3">
                  {t('next')} <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 1 — Personal */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField label={locale === 'ar' ? 'تاريخ الميلاد' : locale === 'fr' ? 'Date de naissance' : 'Date of Birth'} error={errors.dateOfBirth}>
                  <input type="date" className="input" value={form.dateOfBirth} onChange={set('dateOfBirth')}
                    max={new Date().toISOString().split('T')[0]} />
                </FormField>
                <FormField label={locale === 'ar' ? 'الجنسية' : locale === 'fr' ? 'Nationalité' : 'Nationality'} error={errors.nationality}>
                  <input className="input uppercase" value={form.nationality} onChange={set('nationality')}
                    placeholder="TN" maxLength={2} />
                </FormField>
                <FormField label={locale === 'ar' ? 'المدينة' : locale === 'fr' ? 'Ville' : 'City'} required error={errors.city}>
                  <input className="input" value={form.city} onChange={set('city')} placeholder="Tunis" />
                </FormField>
                <FormField label={locale === 'ar' ? 'المستوى الأكاديمي' : locale === 'fr' ? 'Niveau académique' : 'Academic Level'}>
                  <select className="input" value={form.academicLevel} onChange={set('academicLevel')}>
                    <option value="">Select your level</option>
                    <option value="terminale">Terminale / Bac</option>
                    <option value="licence_1">Licence 1</option>
                    <option value="licence_2">Licence 2</option>
                    <option value="licence_3">Licence 3</option>
                    <option value="master_1">Master 1</option>
                    <option value="master_2">Master 2</option>
                    <option value="ingenieur">Ingénieur</option>
                  </select>
                </FormField>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">
                    {t('back')}
                  </button>
                  <button onClick={next} className="btn-primary flex-1 py-3">
                    {t('next')} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Confirm */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Review your info</p>
                  {[
                    { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                    { label: 'Email', value: form.email },
                    { label: 'Phone', value: form.phone || '—' },
                    { label: 'City', value: form.city },
                    { label: 'Nationality', value: form.nationality },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl">
                  <input type="checkbox" id="agree" checked={form.agreed}
                    onChange={e => setForm(f => ({ ...f, agreed: e.target.checked }))}
                    className="mt-0.5 rounded" />
                  <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    {t('agreeTerms')}
                  </label>
                </div>
                {errors.agreed && <p className="text-xs text-red-500">{errors.agreed}</p>}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
                    {t('back')}
                  </button>
                  <button onClick={submit} disabled={loading} className="btn-teal flex-1 py-3">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading ? t('loading') : t('createAccount')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">{t('signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
