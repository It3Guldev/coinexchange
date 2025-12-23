"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  avatar?: string
  createdAt: string
  lastLogin: string
  authMethod: "email" | "google" | "apple" | "facebook" | "github" | "discord"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  loginWithOAuth: (provider: "google" | "apple" | "facebook" | "github" | "discord") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // This would typically check localStorage/cookies for auth token
      const token = localStorage.getItem("auth_token")
      if (token) {
        // Validate token with backend and get user data
        const userData = await validateToken(token)
        if (userData) {
          setUser(userData)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateToken = async (token: string): Promise<User | null> => {
    // Mock implementation - would call your backend API
    try {
      const response = await fetch("/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error("Token validation failed:", error)
    }
    return null
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      // Mock API call - replace with your backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("auth_token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: data.error || "Registration failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  const sendVerificationEmail = async () => {
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        return { success: true }
      } else {
        const data = await response.json()
        return { success: false, error: data.error || "Failed to send verification email" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        return { success: true }
      } else {
        const data = await response.json()
        return { success: false, error: data.error || "Failed to send reset email" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || "Failed to update profile" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const loginWithOAuth = async (provider: "google" | "apple" | "facebook" | "github" | "discord") => {
    // Redirect to OAuth provider
    window.location.href = `/api/auth/oauth/${provider}`
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    sendVerificationEmail,
    resetPassword,
    updateProfile,
    loginWithOAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
