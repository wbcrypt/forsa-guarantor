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
  activateGuarantor: (token: string, password: string) =>
    api.post('/guarantors/activate', { token, password }),
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
