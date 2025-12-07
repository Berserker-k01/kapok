import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Subscriptions from './pages/Subscriptions/Subscriptions'
import Users from './pages/Users/Users'
import Shops from './pages/Shops/Shops'
import { useAuthStore } from './store/authStore'
import { Card, CardBody } from './components/ui/Card'
import Input from './components/ui/Input'
import Button from './components/ui/Button'
import { useState } from 'react'

// Login Admin Refactorisé
const AdminLogin = () => {
  const { login } = useAuthStore()
  const [credentials, setCredentials] = useState({ email: 'admin@lesigne.com', password: 'admin123' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await login(credentials)

    if (!result.success) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <Card className="max-w-md w-full">
        <CardBody className="space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Admin Panel
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Accès administrateur uniquement
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
              <Input
                label="Mot de passe"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Se connecter
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

function App() {
  const { isAuthenticated } = useAuthStore()

  // Configuration Axios
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = useAuthStore.getState().token;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    )
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
