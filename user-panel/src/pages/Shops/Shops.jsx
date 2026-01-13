import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { FiPlus, FiEdit, FiEye, FiSettings, FiGlobe, FiShoppingBag } from 'react-icons/fi'

const Shops = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newShop, setNewShop] = useState({
    name: '',
    slug: '',
    category: 'Mode & Vêtements'
  })
  const { token } = useAuthStore()

  // Configuration Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  const fetchShops = async () => {
    try {
      const response = await axios.get('/shops')
      // CORRECTION ROBUSTE: Gérer les deux formats (Admin vs User)
      setShops(response.data.shops || response.data.data?.shops || [])
    } catch (error) {
      console.error('Erreur chargement boutiques:', error)
      toast.error('Impossible de charger vos boutiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const handleCreateShop = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/shops', newShop)
      toast.success('Boutique créée avec succès !')
      setShowCreateModal(false)
      setNewShop({ name: '', slug: '', category: 'Mode & Vêtements' })
      fetchShops()
    } catch (error) {
      console.error('Erreur création boutique:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleToggleStatus = async (shop) => {
    const newStatus = shop.status === 'active' ? 'suspended' : 'active' // 'suspended' comme inactif temporaire
    try {
      await axios.put(`/shops/${shop.id}`, { status: newStatus })
      toast.success(`Boutique ${newStatus === 'active' ? 'activée' : 'désactivée'}`)
      fetchShops()
    } catch (error) {
      console.error('Erreur changement statut:', error)
      toast.error('Impossible de changer le statut')
    }
  }

  const canCreateShop = shops.length < 2 // Limite gratuite (à synchroniser avec le backend plus tard)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Boutiques</h1>
          <p className="text-gray-600">Gérez vos boutiques en ligne ({shops.length}/2 gratuites)</p>
        </div>

        {canCreateShop && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Créer une boutique
          </button>
        )}
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <div key={shop.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <FiShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                  <Link to={`/s/${shop.slug}`} className="text-sm text-primary-600 hover:underline flex items-center">
                    <FiGlobe className="mr-1 h-3 w-3" />
                    {shop.slug}.lesigne.com
                  </Link>
                </div>
              </div>

              <button
                onClick={() => handleToggleStatus(shop)}
                className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${shop.status === 'active'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {shop.status === 'active' ? 'En ligne' : 'Hors ligne'}
              </button>
            </div>

            {/* Stats (Mockées pour l'instant car endpoint séparé) */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">Produits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">Commandes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">Revenus</p>
              </div>
            </div>

            {/* Theme */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Thème:</span> {shop.theme || 'Défaut'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link to={`/s/${shop.slug}`} className="flex-1 btn-secondary text-sm flex items-center justify-center">
                <FiEye className="mr-1 h-4 w-4" />
                Voir
              </Link>
              <button
                onClick={() => window.location.href = `/shops/${shop.id}/settings`}
                className="flex-1 btn-secondary text-sm flex items-center justify-center"
              >
                <FiEdit className="mr-1 h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => window.location.href = `/shops/${shop.id}/settings`}
                className="btn-secondary p-2"
              >
                <FiSettings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Create Shop Card */}
        {canCreateShop && (
          <div
            onClick={() => setShowCreateModal(true)}
            className="card border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiPlus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Créer une nouvelle boutique</h3>
              <p className="text-sm text-gray-500">
                Vous pouvez créer {2 - shops.length} boutique{2 - shops.length > 1 ? 's' : ''} supplémentaire{2 - shops.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Notice */}
      {!canCreateShop && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Limite atteinte</h3>
              <p className="text-gray-600">
                Vous avez atteint la limite de 2 boutiques gratuites.
                Passez au plan Premium pour créer des boutiques illimitées.
              </p>
            </div>
            <button className="btn-primary">
              Passer au Premium
            </button>
          </div>
        </div>
      )}

      {/* Create Shop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une nouvelle boutique</h3>

              <form onSubmit={handleCreateShop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ma Super Boutique"
                    value={newShop.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                      setNewShop({ ...newShop, name, slug })
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-domaine
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      className="input-field rounded-r-none"
                      placeholder="ma-boutique"
                      value={newShop.slug}
                      onChange={(e) => setNewShop({ ...newShop, slug: e.target.value })}
                      required
                    />
                    <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      .lesigne.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    className="input-field"
                    value={newShop.category}
                    onChange={(e) => setNewShop({ ...newShop, category: e.target.value })}
                  >
                    <option>Mode & Vêtements</option>
                    <option>Électronique</option>
                    <option>Maison & Jardin</option>
                    <option>Sport & Loisirs</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shops
