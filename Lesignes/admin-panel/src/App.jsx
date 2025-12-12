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
import { useState } from 'react'

import Login from './pages/Auth/Login'

function App() {
  const { isAuthenticated } = useAuthStore()

  // Configuration Axios
  useEffect(() => {
    // Relative URL pour passer par le Proxy (Nginx ou Vite)
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/';
    const token = useAuthStore.getState().token;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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
