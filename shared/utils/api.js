// Utilitaires API partagés
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur réseau' }))
        throw new Error(error.error || `Erreur HTTP: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur API:', error)
      throw error
    }
  }

  // Méthodes HTTP
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

// Instance partagée
export const apiClient = new ApiClient()

// Fonctions utilitaires
export const setAuthToken = (token) => {
  apiClient.setToken(token)
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Initialiser le token au chargement
const savedToken = getAuthToken()
if (savedToken) {
  apiClient.setToken(savedToken)
}

export default apiClient
