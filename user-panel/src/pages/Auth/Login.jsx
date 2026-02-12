import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight, FiShoppingBag, FiTrendingUp, FiGlobe } from 'react-icons/fi'

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(credentials)
      if (result.success) {
        toast.success('Connexion réussie!')
      } else {
        toast.error(result.error || 'Erreur de connexion')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-600 font-black text-xl">A</span>
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">Assimε</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-8">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Lancez votre boutique en ligne en quelques minutes
            </h1>
            <p className="text-lg text-primary-100 leading-relaxed max-w-lg">
              La plateforme e-commerce la plus simple d'Afrique. Créez, personnalisez et vendez — sans aucune compétence technique.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-medium">Boutique personnalisable avec thèmes premium</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
                <span className="font-medium">Analytics et suivi des ventes en temps réel</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiGlobe className="w-5 h-5" />
                </div>
                <span className="font-medium">Paiement à la livraison et mobile money</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-primary-200 text-sm">
            © 2025 Assimε. Propulsé par e-Assime.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">A</span>
              </div>
              <span className="text-secondary-900 text-2xl font-bold tracking-tight">Assimε</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">
              Bon retour ! 👋
            </h2>
            <p className="mt-2 text-secondary-500">
              Connectez-vous pour accéder à votre espace marchand.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-secondary-300 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-secondary-700">
                  Mot de passe
                </label>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 border border-secondary-300 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-3.5 text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
            >
              Se connecter
              <FiArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-secondary-400 font-medium">Pas encore de compte ?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="flex items-center justify-center w-full py-3.5 border-2 border-secondary-200 rounded-xl text-secondary-700 font-semibold hover:bg-secondary-100 hover:border-secondary-300 transition-all text-base"
          >
            Créer un compte gratuitement
          </Link>

          {/* Trust */}
          <p className="text-center text-xs text-secondary-400 mt-8">
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="underline hover:text-secondary-600">conditions d'utilisation</a>
            {' '}et notre{' '}
            <a href="#" className="underline hover:text-secondary-600">politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
