import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheck } from 'react-icons/fi'

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const { register } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await register(formData)
            if (result.success) {
                toast.success('Inscription réussie !')
                navigate('/')
            } else {
                toast.error(result.error || 'Erreur d\'inscription')
            }
        } catch (error) {
            toast.error('Erreur d\'inscription')
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        'Boutique en ligne gratuite',
        'Thèmes professionnels personnalisables',
        'Gestion des commandes intégrée',
        'Paiement à la livraison',
        'Analytics et rapports de ventes',
        'Support client dédié',
    ]

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding with Background Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <img
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=80"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-secondary-900/60 to-black/70"></div>
                {/* Subtle accent glow */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
                                <span className="text-primary-600 font-black text-xl">A</span>
                            </div>
                            <span className="text-white text-2xl font-bold tracking-tight drop-shadow-md">Assimε</span>
                        </div>
                    </div>

                    {/* Hero */}
                    <div className="space-y-8">
                        <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight drop-shadow-lg">
                            Commencez à vendre en ligne dès aujourd'hui
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-lg drop-shadow-sm">
                            Rejoignez des centaines de marchands qui font confiance à Assimε pour développer leur activité en ligne.
                        </p>

                        {/* Features List */}
                        <div className="space-y-3">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/90">
                                    <div className="w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">
                                        <FiCheck className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="font-medium text-sm drop-shadow-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-white/40 text-sm">
                        © 2025 Assimε. Propulsé par e-Assime.
                    </p>
                </div>
            </div>

            {/* Right Panel - Register Form */}
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

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">
                            Créer votre compte ✨
                        </h2>
                        <p className="mt-2 text-secondary-500">
                            Lancez votre boutique en moins de 5 minutes.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 mb-2">
                                Nom complet
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Jean Dupont"
                                    className="w-full pl-12 pr-4 py-3.5 border border-secondary-300 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
                                />
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="votre@email.com"
                                    className="w-full pl-12 pr-4 py-3.5 border border-secondary-300 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-secondary-700 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimum 6 caractères"
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
                            Créer mon compte
                            <FiArrowRight className="w-5 h-5" />
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-50 text-secondary-400 font-medium">Déjà inscrit ?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        to="/login"
                        className="flex items-center justify-center w-full py-3.5 border-2 border-secondary-200 rounded-xl text-secondary-700 font-semibold hover:bg-secondary-100 hover:border-secondary-300 transition-all text-base"
                    >
                        Se connecter à mon compte
                    </Link>

                    {/* Trust */}
                    <p className="text-center text-xs text-secondary-400 mt-8">
                        En créant un compte, vous acceptez nos{' '}
                        <a href="#" className="underline hover:text-secondary-600">conditions d'utilisation</a>
                        {' '}et notre{' '}
                        <a href="#" className="underline hover:text-secondary-600">politique de confidentialité</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
