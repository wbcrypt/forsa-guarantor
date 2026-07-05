import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || '') + '/api/v1'
const api = axios.create({ baseURL: BASE, withCredentials: true })

let token: string | null = localStorage.getItem('guarantor_token')
let refreshToken: string | null = localStorage.getItem('guarantor_refresh_token')

api.interceptors.request.use(cfg => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// T-109/K-16 — was `api.post('/auth/refresh')` with an empty body, relying
// solely on `withCredentials` cookies. Confirmed against
// forsa-os/src/auth/dto/login.dto.ts (RefreshTokenDto): the backend requires
// `refreshToken` as a string in the request body — there is no cookie
// fallback — so this call was 400ing on every access-token expiry (15 min
// default), silently forcing users back to /login. Now sends the refresh
// token in the body, same pattern forsa-dashboard/university/partner/student
// already use, and stores the rotated refresh token the backend returns.
api.interceptors.response.use(r => r, async err => {
  if (err.response?.status === 401 && !err.config._retry) {
    err.config._retry = true
    try {
      if (!refreshToken) throw new Error('No refresh token available')
      const r = await api.post('/auth/refresh', { refreshToken })
      token = r.data.accessToken
      refreshToken = r.data.refreshToken
      localStorage.setItem('guarantor_token', token!)
      localStorage.setItem('guarantor_refresh_token', refreshToken!)
      err.config.headers.Authorization = `Bearer ${token}`
      return api(err.config)
    } catch {
      localStorage.removeItem('guarantor_token')
      localStorage.removeItem('guarantor_refresh_token')
      window.location.href = '/login'
    }
  }
  return Promise.reject(err)
})

export const setToken = (t: string, rt?: string) => {
  token = t
  localStorage.setItem('guarantor_token', t)
  if (rt) { refreshToken = rt; localStorage.setItem('guarantor_refresh_token', rt) }
}
export const clearToken = () => {
  token = null; refreshToken = null
  localStorage.removeItem('guarantor_token'); localStorage.removeItem('guarantor_refresh_token')
}

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
  // T-111 — presigned S3 upload flow for the actual receipt file, mirroring
  // documents.service.ts's flow but through a guarantor-scoped route (a
  // guarantor portal user holds none of the staff document.* permissions
  // the generic POST /documents/upload-url route requires).
  getReceiptUploadUrl: (data: { fileName: string; contentType: string }) =>
    api.post('/guarantors/my-student/payment-receipt/upload-url', data),
  confirmReceiptUpload: (documentId: string, fileSize: number) =>
    api.post('/guarantors/my-student/payment-receipt/confirm-upload', { documentId, fileSize }),
  // Submit receipt on behalf of student
  submitReceipt: (data: any) => api.post('/guarantors/my-student/payment-receipt', data),
  // Konnect payment
  initiateKonnect: (data: any) => api.post('/guarantors/my-student/konnect', data),
  // Notifications
  notifications: () => api.get('/guarantors/notifications'),
}

// T-111 — real S3 upload — PUT the raw file bytes to the pre-signed URL
// returned by guarantorApi.getReceiptUploadUrl. Deliberately uses a bare
// `axios` call (not the `api` instance above): the pre-signed URL already
// carries its own auth (SigV4 query params), and `api` would otherwise
// prepend our own baseURL/`/api/v1` prefix and attach our Bearer token —
// both wrong for a direct-to-S3 PUT.
export function uploadFileToS3(uploadUrl: string, file: File) {
  return axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  })
}

export default api
