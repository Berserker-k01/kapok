import { create } from 'zustand'
import axios from 'axios'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await axios.post('/auth/admin/login', credentials);

      if (response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur de connexion au serveur' }
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
