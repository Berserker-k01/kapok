import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiSearch, FiUserX, FiUserCheck, FiLoader, FiMail, FiClock, FiLock, FiSlash, FiShoppingBag } from 'react-icons/fi'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { formatDistanceToNow, parseISO, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'

const SubscriptionTimer = ({ date }) => {
  if (!date) return <span className="text-gray-400">-</span>

  const expiryDate = parseISO(date)
  const isExpired = isPast(expiryDate)

  // Calculate days remaining roughly
  const now = new Date()
  const diffTime = expiryDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let colorClass = "text-green-600 bg-green-50"
  if (isExpired) colorClass = "text-red-600 bg-red-50"
  else if (diffDays <= 7) colorClass = "text-orange-600 bg-orange-50"

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      <FiClock className="mr-1" />
      {isExpired ? 'Expiré' : `Reste ${diffDays}j`}
    </div>
  )
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { token } = useAuthStore()

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/admin/users', {
        params: { search: searchTerm }
      })
      setUsers(response.data.users)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      toast.error('Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleUpdateStatus = async (userId, newStatus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${newStatus === 'banned' ? 'bannir' : 'activer'} cet utilisateur ?`)) return

    try {
      await axios.put(`/admin/users/${userId}/status`, { status: newStatus })
      toast.success(`Utilisateur ${newStatus === 'banned' ? 'banni' : 'activé'}`)
      fetchUsers()
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      toast.error('Impossible de modifier le statut')
    }
  }

  const handleResetPassword = async (userId) => {
    const newPassword = window.prompt("Entrez le nouveau mot de passe (min 6 caractères) :")
    if (!newPassword) return

    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères")
      return
    }

    try {
      await axios.post(`/admin/users/${userId}/reset-password`, { newPassword })
      toast.success("Mot de passe réinitialisé")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la réinitialisation")
    }
  }

  const handleCancelPlan = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler le plan de cet utilisateur ? Il repassera en 'Gratuit' immédiatement.")) return

    try {
      await axios.post(`/admin/users/${userId}/cancel-plan`)
      toast.success("Plan annulé avec succès")
      fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'annulation du plan")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Utilisateurs</h1>
          <p className="text-secondary-500 dark:text-secondary-400">Gérez les comptes de la plateforme</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (Nom, Email)..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-red-500 focus:border-red-500 w-64 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
            <thead className="bg-gray-50 dark:bg-secondary-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Boutiques</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Abonnement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Dépenses Totales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FiLoader className="w-8 h-8 mx-auto animate-spin text-red-600" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-secondary-700 flex items-center justify-center text-gray-600 dark:text-secondary-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-secondary-400 flex items-center">
                            <FiMail className="mr-1 w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info">{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-secondary-400">
                      {user.shop_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">{user.plan === 'free' ? 'Gratuit' : user.plan?.toUpperCase()}</span>
                        {user.plan !== 'free' && <SubscriptionTimer date={user.subscription_end} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {parseFloat(user.total_spent).toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.status === 'active' ? (
                        <div className="flex items-center space-x-2 ml-auto">
                          <button
                            onClick={() => window.open(`/shops?impersonate=${user.id}`, '_blank')}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Voir les boutiques"
                          >
                            <FiShoppingBag className="w-5 h-5" />
                          </button>
                          {user.plan !== 'free' && (
                            <button
                              onClick={() => handleCancelPlan(user.id)}
                              className="text-orange-600 hover:text-orange-900 p-1"
                              title="Annuler le plan"
                            >
                              <FiSlash className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Réinitialiser mot de passe"
                          >
                            <FiLock className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'banned')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Bannir"
                          >
                            <FiUserX className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'active')}
                          className="text-green-600 hover:text-green-900 flex items-center ml-auto"
                          title="Activer"
                        >
                          <FiUserCheck className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Users
