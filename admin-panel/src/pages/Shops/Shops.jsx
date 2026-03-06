import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiSearch, FiExternalLink, FiLoader, FiShoppingBag } from 'react-icons/fi'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

const Shops = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const { token } = useAuthStore()

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  const fetchShops = async () => {
    setLoading(true)
    try {
      // Note: Le backend ne supporte pas encore le filtrage par nom de boutique dans /api/admin/shops
      // On récupère tout et on filtrera côté client pour l'instant, ou on mettra à jour l'API plus tard
      const response = await axios.get('/admin/shops', {
        params: { page, limit: 50 }
      })
      setShops(response.data.shops)
      setHasMore(response.data.shops.length === 50)
    } catch (error) {
      console.error('Erreur chargement boutiques:', error)
      toast.error('Impossible de charger les boutiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [page])

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Boutiques</h1>
          <p className="text-secondary-500 dark:text-secondary-400">Surveillez l'activité des boutiques</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (Nom, Propriétaire)..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Boutique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Propriétaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Produits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Commandes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Revenus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FiLoader className="w-8 h-8 mx-auto animate-spin text-red-600" />
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Aucune boutique trouvée.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <FiShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{shop.name}</div>
                          <div className="text-xs text-gray-500 dark:text-secondary-400">/{shop.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{shop.owner_name}</div>
                      <div className="text-xs text-gray-500 dark:text-secondary-400">{shop.owner_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-secondary-400">
                      {shop.product_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-secondary-400">
                      {shop.order_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {parseFloat(shop.total_revenue).toLocaleString()} {shop.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={shop.status === 'active' ? 'success' : 'warning'}>
                        {shop.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            const url = `https://${shop.slug}.assime.net`;
                            navigator.clipboard.writeText(url);
                            toast.success('Lien copié !');
                          }}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="Copier le lien"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <a
                          href={`https://${shop.slug}.assime.net`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir la boutique"
                        >
                          <FiExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-secondary-700">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 text-sm font-medium rounded-md ${page === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-primary-600 bg-white border border-primary-200 hover:bg-primary-50'}`}
          >
            Précédent
          </button>
          <span className="text-secondary-600 text-sm font-medium">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className={`px-4 py-2 text-sm font-medium rounded-md ${!hasMore ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-primary-600 bg-white border border-primary-200 hover:bg-primary-50'}`}
          >
            Suivant
          </button>
        </div>
      </Card>
    </div>
  )
}

export default Shops
