import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finet_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle 401 Unauthorized
api.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Clear token and redirect to login if unauthorized
    localStorage.removeItem('finet_token')
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth'
    }
  }
  return Promise.reject(error)
})

export default api
