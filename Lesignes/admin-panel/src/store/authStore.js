import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const data = await response.json()
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true
        })
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Identifiants invalides' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' }
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  },

  updateUser: (userData) => {
    set(state => ({
      user: { ...state.user, ...userData }
    }))
  }
}))
