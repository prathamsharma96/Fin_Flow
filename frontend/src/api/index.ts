import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('finflow_token')
      localStorage.removeItem('finflow_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const recordsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/records', { params }),
  getById: (id: string) => api.get(`/records/${id}`),
  create: (data: Record<string, unknown>) => api.post('/records', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/records/${id}`, data),
  delete: (id: string) => api.delete(`/records/${id}`),
}

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  trends: () => api.get('/dashboard/trends'),
  categories: () => api.get('/dashboard/categories'),
}

export const usersApi = {
  getAll: () => api.get('/users'),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export default api
