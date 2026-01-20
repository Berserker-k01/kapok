import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { FiPlus, FiEdit, FiEye, FiSettings, FiGlobe, FiShoppingBag, FiTrash2, FiStar } from 'react-icons/fi'

const Shops = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [shopToDelete, setShopToDelete] = useState(null)
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
      const response = await axios.get('/api/shops')
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
      await axios.post('/api/shops', newShop)
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
      await axios.put(`/api/shops/${shop.id}`, { status: newStatus })
      toast.success(`Boutique ${newStatus === 'active' ? 'activée' : 'désactivée'}`)
      fetchShops()
    } catch (error) {
      console.error('Erreur changement statut:', error)
      toast.error('Impossible de changer le statut')
    }
  }

  const handleDeleteShop = async () => {
    if (!shopToDelete) return

    try {
      await axios.delete(`/api/shops/${shopToDelete.id}`)
      toast.success('Boutique supprimée avec succès')
      setShowDeleteModal(false)
      setShopToDelete(null)
      fetchShops()
    } catch (error) {
      console.error('Erreur suppression boutique:', error)
      toast.error('Impossible de supprimer la boutique')
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Boutiques</h1>
          <p className="text-gray-600">Gérez vos boutiques en ligne ({shops.length}/2 gratuites)</p>
        </div>

        {canCreateShop && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center justify-center md:w-auto w-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Créer une boutique
          </button>
        )}
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shops.map((shop) => (
          <div key={shop.id} className="flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-300">
                    <FiShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">{shop.name}</h3>
                    <a href={`/s/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-primary-600 flex items-center transition-colors">
                      <FiGlobe className="mr-1.5 h-3.5 w-3.5" />
                      {shop.slug}.lesigne.com
                    </a>
                  </div>
                </div>

                <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${shop.status === 'active'
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}>
                  {shop.status === 'active' ? 'En ligne' : 'Hors ligne'}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-50 my-4">
                <div className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-lg font-bold text-gray-900">-</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Produits</p>
                </div>
                <div className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-lg font-bold text-gray-900">-</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Commandes</p>
                </div>
                <div className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-lg font-bold text-gray-900">-</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Revenus</p>
                </div>
              </div>

              {/* Theme & Meta */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Thème actif</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {shop.theme === 'minimal' ? '✨ Minimal' : shop.theme === 'bold' ? '💥 Bold' : shop.theme === 'custom' ? '🎨 Personnalisé' : '✨ Minimal'}
                </span>
              </div>
            </div>

            {/* Actions Footer - Pushed to bottom */}
            <div className="mt-auto bg-gray-50/50 p-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/s/${shop.slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Lien copié !');
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                  title="Copier le lien"
                >
                  <FiGlobe className="h-4 w-4" />
                </button>
                <a
                  href={`/s/${shop.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                  title="Voir la boutique"
                >
                  <FiEye className="h-4 w-4" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/shops/${shop.id}/settings`}
                  className="btn-secondary text-xs px-4 py-2 flex items-center justify-center bg-white hover:bg-gray-50"
                >
                  <FiEdit className="mr-2 h-3.5 w-3.5" />
                  Gérer
                </Link>
                <button
                  onClick={() => handleToggleStatus(shop)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                  title={shop.status === 'active' ? 'Désactiver' : 'Activer'}
                >
                  <FiSettings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setShopToDelete(shop)
                    setShowDeleteModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create Shop Card */}
        {canCreateShop && (
          <div
            onClick={() => setShowCreateModal(true)}
            className="group flex flex-col h-full min-h-[320px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary-500 hover:bg-primary-50/30 cursor-pointer transition-all duration-300 items-center justify-center text-center p-8"
          >
            <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
              <FiPlus className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
              Créer une boutique
            </h3>
            <p className="text-gray-500 max-w-[200px] group-hover:text-primary-600/70 transition-colors">
              Il vous reste <span className="font-semibold">{2 - shops.length}</span> emplacement{2 - shops.length > 1 ? 's' : ''} gratuit{2 - shops.length > 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Notice - Premium Banner */}
      {!canCreateShop && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-primary-500 opacity-20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-6">
            <div className="flex items-start space-x-6">
              <div className="hidden md:flex h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl items-center justify-center flex-shrink-0 border border-white/10">
                <FiStar className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-xs font-bold bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/20 uppercase tracking-wider">
                    Limite atteinte
                  </span>
                  <div className="md:hidden">
                    <FiStar className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Passez à la vitesse supérieure
                </h3>
                <p className="text-gray-300 max-w-xl text-lg leading-relaxed">
                  Vous avez utilisé vos 2 boutiques gratuites. Débloquez la création illimitée et accédez à des thèmes exclusifs avec le plan Premium.
                </p>
              </div>
            </div>

            <button className="flex-shrink-0 bg-white text-gray-900 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 whitespace-nowrap">
              Passer au Premium
            </button>
          </div>
        </div>
      )}

      {/* Create Shop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nouvelle boutique</h3>
              <p className="text-gray-500 mb-6">Configurez votre nouvelle boutique en quelques secondes.</p>

              <form onSubmit={handleCreateShop} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow outline-none"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sous-domaine
                  </label>
                  <div className="flex rounded-lg shadow-sm">
                    <input
                      type="text"
                      className="flex-1 min-w-0 px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow outline-none border-r-0"
                      placeholder="ma-boutique"
                      value={newShop.slug}
                      onChange={(e) => setNewShop({ ...newShop, slug: e.target.value })}
                      required
                    />
                    <span className="inline-flex items-center px-4 rounded-r-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                      .lesigne.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow outline-none appearance-none bg-white"
                      value={newShop.category}
                      onChange={(e) => setNewShop({ ...newShop, category: e.target.value })}
                    >
                      <option>Mode & Vêtements</option>
                      <option>Électronique</option>
                      <option>Maison & Jardin</option>
                      <option>Sport & Loisirs</option>
                      <option>Autre</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-3 font-semibold rounded-xl hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    Créer ma boutique
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && shopToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all scale-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
                <FiTrash2 className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer la boutique ?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer <strong className="text-gray-900">{shopToDelete.name}</strong> ?
                Ce changement est irréversible.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setShopToDelete(null)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteShop}
                  className="flex-1 bg-red-600 text-white px-4 py-3 font-semibold rounded-xl hover:bg-red-700 shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shops
