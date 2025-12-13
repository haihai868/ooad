import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isStudent: boolean
  isTeacher: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const tokenData = await authService.login({ username, password })
    localStorage.setItem('access_token', tokenData.access_token)
    
    const userData = await authService.getCurrentUser()
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (username: string, email: string, password: string, role = 'STUDENT') => {
    const userData = await authService.register({ username, email, password, role: role as any })
    // Auto login after registration
    const tokenData = await authService.login({ username, password })
    localStorage.setItem('access_token', tokenData.access_token)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.role === 'STUDENT' || user?.role === 'PAID_STUDENT',
    isTeacher: user?.role === 'TEACHER',
    isAdmin: user?.role === 'ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

