import { useState, useEffect, useContext, createContext } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('finet_token')
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data)
        })
        .catch(() => {
          localStorage.removeItem('finet_token')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('finet_token', access_token)
    setUser(userData)
    return userData
  }

  const register = async (phone, password, fullName) => {
    const res = await api.post('/auth/register', { phone, password, full_name: fullName })
    const { access_token, user: userData } = res.data
    localStorage.setItem('finet_token', access_token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('finet_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
