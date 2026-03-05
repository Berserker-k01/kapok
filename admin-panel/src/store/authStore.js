import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        try {
          const response = await axios.post('/auth/admin/login', credentials)

          if (response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true
            })
            // Injecter le token par défaut pour Axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error.response?.data?.error || 'Erreur de connexion au serveur' }
        }
      },

      logout: () => {
        // Nettoyer le header Axios
        delete axios.defaults.headers.common['Authorization']
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
    }),
    {
      name: 'admin-auth-storage', // Clé dans localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
