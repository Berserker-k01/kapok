import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import CustomThemeLayout from './layouts/CustomThemeLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Auth/Login'
import OrderValidation from './pages/OrderValidation/OrderValidation'
import CheckoutCOD from './pages/Checkout/CheckoutCOD'
import Checkout from './pages/Checkout/Checkout'
import ShopSettings from './pages/Shops/ShopSettings'
import PublicShop from './pages/Shops/PublicShop'
import Products from './pages/Products/Products'
import Orders from './pages/Orders/Orders'
import Shops from './pages/Shops/Shops'
import { useAuthStore } from './store/authStore'
import { Card, CardBody } from './components/ui/Card'
import axios from 'axios'
import { useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

// Pages simples pour les autres routes (Placeholder amélioré)
const PlaceholderPage = ({ title, description, icon, color }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-secondary-900">{title}</h1>
    <Card>
      <CardBody className="text-center py-12">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${color}`}>
          <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="text-lg font-medium text-secondary-900">Module {title}</h3>
        <p className="text-secondary-500 mt-2 max-w-md mx-auto">{description}</p>
      </CardBody>
    </Card>
  </div>
)

const ShopsPage = () => <PlaceholderPage title="Mes Boutiques" description="Gérez vos boutiques, configurez vos thèmes et paramètres." icon="🏪" color="bg-blue-100 text-blue-600" />
const AnalyticsPage = () => <PlaceholderPage title="Analytics" description="Visualisez les performances de vos boutiques." icon="📊" color="bg-purple-100 text-purple-600" />
const SettingsPage = () => <PlaceholderPage title="Paramètres" description="Gérez votre compte et vos préférences." icon="⚙️" color="bg-gray-100 text-gray-600" />

function App() {
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    // Configuration de l'URL de base pour Axios
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
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
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
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
