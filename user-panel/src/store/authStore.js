import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    // Connexion démo pour tests locaux
    if (credentials.demo) {
      // Simuler une connexion réussie avec un utilisateur de test
      set({
        user: {
          id: 999,
          name: 'Utilisateur Démo',
          email: 'demo@lesigne.com',
          role: 'user'
        },
        token: 'demo-token-' + Date.now(),
        isAuthenticated: true
      })
      return { success: true }
    }

    // Connexion normale via API
    try {
      // API call réelle
      const response = await axios.post('/auth/login', credentials);

      if (response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur de connexion' }
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);

      if (response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur lors de l\'inscription' }
    }
  },

  checkAuth: async () => {
    try {
      const { token } = get()
      if (!token) return false

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/auth/verify')

      if (response.data?.valid) {
        // Merge existing user data with fresh data (keeping things like name if local, but respecting remote plan etc)
        const freshUser = response.data.user
        set(state => ({
          user: { ...state.user, ...freshUser },
          isAuthenticated: true
        }))
        return true
      }
      return false
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        get().logout()
        return false
      }
      return true // Keep session locally on network error? Or careful? Let's assume keep unless 401.
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
