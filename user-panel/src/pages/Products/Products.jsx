import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiImage, FiSearch, FiFilter, FiLoader, FiCpu, FiBox, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/currency'

const Products = () => {
  const [products, setProducts] = useState([])
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Vêtements',
    stock: '',
    shopId: ''
  })
  const { token } = useAuthStore()

  // Configuration Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  // Charger les boutiques au démarrage
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('/shops')
        const shopsData = response.data.data?.shops || []
        setShops(shopsData)
        if (shopsData.length > 0) {
          setSelectedShop(shopsData[0].id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Erreur chargement boutiques:', error)
        toast.error('Impossible de charger vos boutiques')
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  // Charger les produits quand la boutique sélectionnée change
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedShop) return

      setLoading(true)
      try {
        const response = await axios.get(`/products/shop/${selectedShop}`)
        setProducts(response.data.products)
      } catch (error) {
        console.error('Erreur chargement produits:', error)
        toast.error('Impossible de charger les produits')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedShop])

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/products', {
        ...newProduct,
        shopId: selectedShop,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      })

      toast.success('Produit créé avec succès')
      setShowAddModal(false)
      setNewProduct({ name: '', price: '', description: '', category: 'Vêtements', stock: '', shopId: '' })

      // Recharger la liste
      const response = await axios.get(`/products/shop/${selectedShop}`)
      setProducts(response.data.products)
    } catch (error) {
      console.error('Erreur création produit:', error)
      toast.error('Erreur lors de la création du produit')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      await axios.delete(`/products/${productId}`)
      toast.success('Produit supprimé')
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Erreur suppression produit:', error)
      toast.error('Impossible de supprimer le produit')
    }
  }

  const handleGenerateDescription = async () => {
    if (!newProduct.name) {
      toast.error('Veuillez entrer un nom de produit d\'abord')
      return
    }

    const toastId = toast.loading('Génération de la description...')
    try {
      const response = await axios.post('/ai/generate-description', {
        productName: newProduct.name,
        keywords: [newProduct.category, 'qualité', 'tendance']
      })

      setNewProduct(prev => ({ ...prev, description: response.data.data.description }))
      toast.success('Description générée !', { id: toastId })
    } catch (error) {
      console.error('Erreur IA:', error)
      toast.error('Erreur lors de la génération', { id: toastId })
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && shops.length === 0) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <div className="flex items-center space-x-3">
          {shops.length > 0 ? (
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="input-field w-48"
            >
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-red-500">Aucune boutique trouvée</span>
          )}

          <Button
            onClick={() => setShowAddModal(true)}
            disabled={shops.length === 0}
            className="flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:shadow-md transition-shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold text-secondary-900">{products.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiBox className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <FiLoader className="w-8 h-8 mx-auto animate-spin text-primary-600" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiBox className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun produit trouvé</h3>
                      <p className="text-gray-500 mb-6 max-w-sm">
                        Commencez par ajouter votre premier produit à cette boutique.
                      </p>
                      <Button
                        onClick={() => setShowAddModal(true)}
                        disabled={shops.length === 0}
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Ajouter un produit
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <FiImage className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stock} unités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-4 p-2 hover:bg-red-50 rounded-full"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={() => setShowAddModal(false)}
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 z-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Ajouter un produit</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                      <input
                        type="text"
                        className="input-field"
                        required
                        placeholder="Ex: T-shirt Coton Bio"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        required
                        placeholder="0.00"
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        className="text-xs flex items-center text-purple-600 hover:text-purple-800 font-medium px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                      >
                        <FiCpu className="mr-1" />
                        Générer avec l'IA
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Description détaillée du produit..."
                      value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <select
                        className="input-field"
                        value={newProduct.category}
                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option>Vêtements</option>
                        <option>Électronique</option>
                        <option>Maison</option>
                        <option>Beauté</option>
                        <option>Accessoires</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial *</label>
                      <input
                        type="number"
                        className="input-field"
                        required
                        placeholder="0"
                        value={newProduct.stock}
                        onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                    >
                      Ajouter le produit
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Products
