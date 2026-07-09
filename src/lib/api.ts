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
  // QA-5 fix — a 401 on /auth/logout itself (e.g. the access token used
  // to make the call was already cleared client-side, or the server
  // invalidates it before responding) used to trigger the same
  // refresh-or-hard-redirect handling as any other 401. That's exactly
  // backwards for a logout call: attempting a token refresh right after
  // intentionally logging out can silently re-establish a session, and
  // the fallback `window.location.href = '/login'` causes a jarring
  // full-page reload during what should be a clean, local state change
  // (e.g. InvitePage's "switch account" action). A failed logout call is
  // never actionable — we're already discarding the session either way.
  if (err.response?.status === 401 && err.config?.url?.includes('/auth/logout')) {
    return Promise.reject(err)
  }
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
}

// The invite-token flow this used to just be a comment wishing for —
// migration 004 added guarantors.invite_token for exactly this, but no
// endpoint ever generated, emailed, or validated one. Now implemented:
// staff adds a guarantor -> invite email -> these 3 routes.
export const inviteApi = {
  preview: (token: string) => api.get(`/guarantors/invite/${token}`),
  accept: (token: string, password: string) => api.post(`/guarantors/invite/${token}/accept`, { password }),
  decline: (token: string, reason?: string) => api.post(`/guarantors/invite/${token}/decline`, { reason }),
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
  // Phase 13 (Case Management) — "Guarantor should always know: Invitation
  // Status, Profile Status, Documents Remaining, Meeting Information."
  caseStatus: () => api.get('/guarantors/my-case'),
  updateFinancialProfile: (data: any) => api.patch('/guarantors/my-case/financial-profile', data),
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
