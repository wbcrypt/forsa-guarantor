import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || '') + '/api/v1'
const api = axios.create({ baseURL: BASE, withCredentials: true })

let token: string | null = localStorage.getItem('guarantor_token')

api.interceptors.request.use(cfg => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, async err => {
  if (err.response?.status === 401 && !err.config._retry) {
    err.config._retry = true
    try {
      const r = await api.post('/auth/refresh')
      token = r.data.accessToken
      localStorage.setItem('guarantor_token', token!)
      err.config.headers.Authorization = `Bearer ${token}`
      return api(err.config)
    } catch {
      localStorage.removeItem('guarantor_token')
      window.location.href = '/login'
    }
  }
  return Promise.reject(err)
})

export const setToken = (t: string) => { token = t; localStorage.setItem('guarantor_token', t) }
export const clearToken = () => { token = null; localStorage.removeItem('guarantor_token') }

export const authApi = {
  login: (d: any) => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  // NOTE: activateGuarantor/`POST /guarantors/activate` is dead code — no
  // matching backend route exists (confirmed against forsa-os/src/guarantors).
  // It hints at a nicer token-based invite flow (migration 004 already added
  // guarantors.invite_token for exactly this) but that was never built. T-102
  // implements the simpler email+password activation below instead
  // (POST /guarantors/register, real and working) — do not call this method.
  activateGuarantor: (token: string, password: string) =>
    api.post('/guarantors/activate', { token, password }),
  // T-102 — activates portal access for a guarantor record staff already
  // created (by email). Real, working backend endpoint.
  registerGuarantor: (d: { tenantId: string; email: string; password: string; fullName: string }) =>
    api.post('/guarantors/register', d),
}

export const guarantorApi = {
  // Dashboard — linked student summary
  studentSummary: () => api.get('/guarantors/my-student'),
  // Payment schedule
  paymentSchedule: () => api.get('/guarantors/my-student/payments'),
  // Submit receipt on behalf of student
  submitReceipt: (data: any) => api.post('/guarantors/my-student/payment-receipt', data),
  // Konnect payment
  initiateKonnect: (data: any) => api.post('/guarantors/my-student/konnect', data),
  // Notifications
  notifications: () => api.get('/guarantors/notifications'),
}

export default api
