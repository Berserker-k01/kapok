import { create } from 'zustand'
import axios from 'axios'

// Récupérer les données persistées
const getPersistedAuth = () => {
  try {
    const token = localStorage.getItem('admin_token')
    const user = JSON.parse(localStorage.getItem('admin_user') || 'null')
    return {
      token,
      user,
      isAuthenticated: !!(token && user)
    }
  } catch {
    return { token: null, user: null, isAuthenticated: false }
  }
}

export const useAuthStore = create((set, get) => ({
  ...getPersistedAuth(),

  login: async (credentials) => {
    try {
      const response = await axios.post('/auth/admin/login', credentials);

      if (response.data) {
        const { user, token } = response.data

        // Persister dans localStorage
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify(user))

        set({
          user,
          token,
          isAuthenticated: true
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur de connexion au serveur' }
    }
  },

  logout: () => {
    // Nettoyer localStorage
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  },

  updateUser: (userData) => {
    set(state => {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('admin_user', JSON.stringify(updatedUser))
      return { user: updatedUser }
    })
  }
}))
