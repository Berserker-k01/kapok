import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import CustomThemeLayout from './layouts/CustomThemeLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import OrderValidation from './pages/OrderValidation/OrderValidation'
import CheckoutCOD from './pages/Checkout/CheckoutCOD'
import Checkout from './pages/Checkout/Checkout'
import ShopSettings from './pages/Shops/ShopSettings'
import PublicShop from './pages/Shops/PublicShop'
import Products from './pages/Products/Products'
import Orders from './pages/Orders/Orders'
import Shops from './pages/Shops/Shops'
import Analytics from './pages/Analytics/Analytics'
import Settings from './pages/Settings/Settings'
import PlanSelection from './pages/Subscriptions/PlanSelection'
import Payment from './pages/Subscriptions/Payment'
import PaymentStatus from './pages/Subscriptions/PaymentStatus'
import { useAuthStore } from './store/authStore'
import axios from 'axios'
import { useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import ReloadPrompt from './components/ReloadPrompt'

function App() {
  const { isAuthenticated, token } = useAuthStore()

  // Configuration Axios Globale (Interceptor > useEffect pour éviter les race conditions)
  useEffect(() => {
    // URL Backend
    axios.defaults.baseURL = 'https://e-assime.com/api';

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

    // Intercepteur pour gérer les 401 (Session expirée)
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Optionnel : Auto-logout si 401 (Token invalide/expiré)
          // useAuthStore.getState().logout();
        }
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
      window.location.href = '/login';
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

  return (
    <ErrorBoundary>
      <Router>
        <ReloadPrompt />
        <Routes>
          {/* Routes Publiques */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/validate-order/:orderId" element={<OrderValidation />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/cod/:productId" element={<CheckoutCOD />} />
          <Route path="/s/:slug" element={<PublicShop />} />
          <Route path="/theme-preview" element={
            <CustomThemeLayout config={{
              colors: {
                primary: '#7c3aed', // Purple
                secondary: '#1f2937',
                background: '#f3f4f6',
                text: '#111827',
                footerBg: '#111827',
                footerText: '#f9fafb'
              },
              content: {
                shopName: 'Ma Boutique Démo',
                logoUrl: null
              }
            }}>
              <div className="page-width max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-6">Bienvenue sur Ma Boutique Démo</h1>
                <p className="text-lg text-gray-600 mb-8">Ceci est un aperçu du thème avec des couleurs personnalisées (Violet).</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                    <h2 className="text-xl font-bold mb-2">Produit 1</h2>
                    <p className="text-gray-500 mb-4">Description du produit...</p>
                    <button className="btn btn--primary w-full">Ajouter au panier</button>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                    <h2 className="text-xl font-bold mb-2">Produit 2</h2>
                    <p className="text-gray-500 mb-4">Description du produit...</p>
                    <button className="btn btn--primary w-full">Ajouter au panier</button>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                    <h2 className="text-xl font-bold mb-2">Produit 3</h2>
                    <p className="text-gray-500 mb-4">Description du produit...</p>
                    <button className="btn btn--primary w-full">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            </CustomThemeLayout>
          } />

          {/* Routes Protégées */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/shops" element={<Shops />} />
                    <Route path="/shops/:shopId/settings" element={<ShopSettings />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/subscriptions" element={<PlanSelection />} />
                    <Route path="/subscriptions/payment/:planKey" element={<Payment />} />
                    <Route path="/subscriptions/payment-status/:paymentId" element={<PaymentStatus />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </ErrorBoundary>
  )
}

export default App
