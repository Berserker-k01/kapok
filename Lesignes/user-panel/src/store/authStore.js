import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    // Simulation connexion démo
    if (credentials.demo || credentials.email === 'demo@user.com') {
      set({
        user: {
          id: 1,
          name: 'Utilisateur Démo',
          email: 'demo@user.com',
          role: 'user'
        },
        token: 'demo-token-123',
        isAuthenticated: true
      })
      return { success: true }
    }

    try {
      // API call réelle (à implémenter)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
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
        return { success: false, error: 'Identifiants invalides' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    }
  },

  register: async (userData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
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
        return { success: false, error: errorData.error || errorData.message || 'Erreur lors de l\'inscription' }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
    localStorage.removeItem('auth-storage') // Nettoyage complet
  },

  updateUser: (userData) => {
    set(state => ({
      user: { ...state.user, ...userData }
    }))
  }
}), {
  name: 'auth-storage', // nom de la clé dans localStorage
  getStorage: () => localStorage, // (optionnel) par défaut c'est localStorage
}))
