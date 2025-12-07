import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Card, CardBody } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'

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

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      const result = await login({ demo: true })
      if (result.success) {
        toast.success('Connexion démo réussie!')
      }
    } catch (error) {
      toast.error('Erreur de connexion démo')
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
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Connexion à Assimε
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Accédez à votre dashboard utilisateur
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Adresse email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="votre@email.com"
              />

              <Input
                label="Mot de passe"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Se connecter
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleDemoLogin}
                isLoading={isLoading}
                className="w-full"
              >
                Connexion Démo
              </Button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default Login
