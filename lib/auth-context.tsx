'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

interface User {
  id?: string
  email: string
  username: string
  name?: string
  image?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string) => Promise<boolean>
  socialLogin: (provider: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (session?.user) {
      // User is signed in with NextAuth
      setUser({
        id: session.user.id || '',
        email: session.user.email || '',
        username: session.user.username || session.user.name || '',
        name: session.user.name || undefined,
        image: session.user.image || undefined
      })
      setToken('nextauth-session') // Placeholder for NextAuth sessions
    } else {
      // Check for existing token on mount
      const savedToken = localStorage.getItem('chess_token')
      if (savedToken) {
        setToken(savedToken)
        // Verify token and get user info
        fetchUserInfo(savedToken)
      } else {
        setUser(null)
        setToken(null)
      }
    }
    setLoading(false)
  }, [session, status])

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('chess_token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      localStorage.removeItem('chess_token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('chess_token', data.token)
        return true
      } else {
        console.error('Login failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('chess_token', data.token)
        return true
      } else {
        console.error('Registration failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const socialLogin = async (provider: string) => {
    await signIn(provider, { callbackUrl: '/' })
  }

  const logout = () => {
    if (session) {
      signOut({ callbackUrl: '/' })
    } else {
      setUser(null)
      setToken(null)
      localStorage.removeItem('chess_token')
    }
  }

  const value = {
    user,
    token,
    login,
    register,
    socialLogin,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
