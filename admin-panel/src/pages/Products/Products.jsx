import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiSearch, FiLoader, FiPackage, FiTrash2, FiExternalLink } from 'react-icons/fi'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

const Products = () => {
    const [products, setProducts] = useState([])
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

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/admin/products', {
                params: { search: searchTerm, page, limit: 50 }
            })
            setProducts(response.data.products)
            setHasMore(response.data.products.length === 50)
        } catch (error) {
            console.error('Erreur chargement produits:', error)
            toast.error('Impossible de charger les produits')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [page]) // Refetch when page changes

    // Reset pagination on search
    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchProducts()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Tous les Produits</h1>
                    <p className="text-secondary-500 dark:text-secondary-400">Gérez l'ensemble du catalogue de la plateforme</p>
                </div>
                <form onSubmit={handleSearch} className="relative flex gap-2">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher (Produit, Boutique)..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-red-500 focus:border-red-500 w-64 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Rechercher
                    </button>
                </form>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
                        <thead className="bg-gray-50 dark:bg-secondary-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Produit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Boutique</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Prix</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-secondary-400 uppercase tracking-wider">Catégorie</th>
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
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        Aucun produit trouvé.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <FiPackage className="text-red-600 w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-secondary-500">ID: {product.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-secondary-900 dark:text-white">{product.shop_name}</div>
                                            <div className="text-xs text-secondary-500">Propriétaire: {product.owner_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                                            {parseFloat(product.price).toLocaleString()} XOF
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="secondary">{product.category}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
                                                {product.status || 'active'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <a
                                                    href={`https://${product.shop_slug}.assime.net/product/${product.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir le produit"
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

export default Products
