import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiSearch, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { Card, CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

const PLANS = {
  free: { name: 'Gratuit', color: 'bg-gray-100 text-gray-800', limit: 2 },
  basic: { name: 'Basic', color: 'bg-blue-100 text-blue-800', limit: 5 },
  pro: { name: 'Pro', color: 'bg-purple-100 text-purple-800', limit: '∞' }
}

const Subscriptions = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const { token } = useAuthStore()

  // Configurer axios pour inclure le token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users')
      setUsers(response.data.users)
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUpdatePlan = async (userId, newPlan) => {
    try {
      await axios.put(`/api/users/${userId}/plan`, { plan: newPlan })
      toast.success("Plan mis à jour avec succès")
      setEditingUser(null)
      fetchUsers() // Rafraîchir la liste
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du plan")
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Gestion des Abonnements</h1>
          <p className="text-secondary-500 dark:text-secondary-400">Gérez les plans et les limites des utilisateurs</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Plan Actuel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Boutiques</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-secondary-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-secondary-700 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                        defaultValue={user.plan || 'free'}
                        onChange={(e) => handleUpdatePlan(user.id, e.target.value)}
                        autoFocus
                        onBlur={() => setEditingUser(null)}
                      >
                        <option value="free">Gratuit</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(PLANS[user.plan] || PLANS['free']).color}`}>
                        {(PLANS[user.plan] || PLANS['free']).name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-secondary-400">
                    <span className="font-medium text-gray-900 dark:text-white">{user.shop_count}</span>
                    <span className="text-gray-400"> / {(PLANS[user.plan] || PLANS['free']).limit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Subscriptions
