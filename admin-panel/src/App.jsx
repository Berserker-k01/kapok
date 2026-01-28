import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
const basename = '/admin';
import axios from 'axios'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Subscriptions from './pages/Subscriptions/Subscriptions'
import Users from './pages/Users/Users'
import Shops from './pages/Shops/Shops'
import PaymentRequests from './pages/PaymentRequests/PaymentRequests'
import Plans from './pages/Plans/Plans'
import PaymentNumbers from './pages/PaymentNumbers/PaymentNumbers'
import Settings from './pages/Settings/Settings'
import { useAuthStore } from './store/authStore'
import { useState } from 'react'

import Login from './pages/Auth/Login'

function App() {
  const { isAuthenticated } = useAuthStore()

  // Configuration Axios
  // Configuration Axios Globale (Interceptor > useEffect pour éviter les race conditions)
  useEffect(() => {
    // Relative URL pour passer par le Proxy (Nginx ou Vite)
    // Relative URL pour passer par le Proxy (Nginx ou Vite)
    // Dynamic Environment Configuration
    const isDev = import.meta.env.DEV;
    axios.defaults.baseURL = isDev ? '/api' : 'https://e-assime.com/api';

    // Intercepteur pour injecter le token en temps réel
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // AUTO-LOGOUT INACTIVITY system (15 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes
    let inactivityTimer;

    const logoutUser = () => {
      console.log('Auto-logout due to inactivity');
      useAuthStore.getState().logout();
      // Admin might not need full refresh if state handles it, but safety first
      // The state change to isAuthenticated=false will trigger the router switch below
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUser, TIMEOUT_MS);
    };

    // Listen to user interactions
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    for (const event of events) {
      window.addEventListener(event, resetTimer);
    }

    resetTimer(); // Init timer

    return () => {
      clearTimeout(inactivityTimer);
      for (const event of events) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Router basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    )
  }

  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/payment-requests" element={<PaymentRequests />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/payment-numbers" element={<PaymentNumbers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
