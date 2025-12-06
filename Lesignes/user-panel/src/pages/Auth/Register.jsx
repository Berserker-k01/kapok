import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Card, CardBody } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Link, useNavigate } from 'react-router-dom'

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
            <Card className="max-w-md w-full">
                <CardBody className="space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">L</span>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
                            Créer un compte
                        </h2>
                        <p className="mt-2 text-sm text-secondary-600">
                            Rejoignez Lesigne et lancez votre boutique
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="Nom complet"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Jean Dupont"
                            />

                            <Input
                                label="Adresse email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="votre@email.com"
                            />

                            <Input
                                label="Mot de passe"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full"
                            >
                                S'inscrire
                            </Button>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    )
}

export default Register
