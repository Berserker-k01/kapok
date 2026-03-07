import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiImage, FiSearch, FiFilter, FiLoader, FiCpu, FiBox, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/currency'
import { resolveImageUrl } from '../../utils/imageUrl'

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
    shopId: '',
    collectionId: '' // [NEW] Optional Collection
  })
  const [collections, setCollections] = useState([]) // [NEW] Collections state
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
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

        // Restore from localStorage or default to first shop
        const savedShopId = localStorage.getItem('selectedShopId')
        if (savedShopId && shopsData.find(s => s.id === savedShopId)) {
          setSelectedShop(savedShopId)
        } else if (shopsData.length > 0) {
          setSelectedShop(shopsData[0].id)
          localStorage.setItem('selectedShopId', shopsData[0].id)
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

  // [NEW] Fetch Collections when shop changes
  useEffect(() => {
    const fetchCollections = async () => {
      if (!selectedShop) return
      try {
        const response = await axios.get('/collections', { params: { shopId: selectedShop } })
        setCollections(response.data.data.collections || [])
      } catch (error) {
        console.error('Erreur chargement collections', error)
      }
    }
    fetchCollections()
  }, [selectedShop])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // Limit to 5 files
      const newFiles = files.slice(0, 5)
      setImageFiles(newFiles)
      setImagePreviews(newFiles.map(file => URL.createObjectURL(file)))
    }
  }

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || 'Vêtements',
      stock: product.inventory || product.stock || 0, // Fallback naming
      shopId: product.shop_id,
      collectionId: product.collection_id || ''
    })

    // Resolve multiple images
    const previews = []
    if (product.images && Array.isArray(product.images)) {
      previews.push(...product.images.map(img => resolveImageUrl(img)))
    } else if (product.image_url) {
      previews.push(resolveImageUrl(product.image_url))
    }
    setImagePreviews(previews)
    setImageFiles([])
    setEditingId(product.id)
    setIsEditing(true)
    setShowAddModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', newProduct.name)
    formData.append('price', newProduct.price)
    formData.append('description', newProduct.description)
    formData.append('category', newProduct.category)
    formData.append('stock', newProduct.stock)
    formData.append('shopId', selectedShop)
    if (newProduct.collectionId) formData.append('collectionId', newProduct.collectionId) // [NEW]

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file)
      })
    }

    try {
      if (isEditing) {
        await axios.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Produit modifié avec succès')
      } else {
        await axios.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Produit créé avec succès')
      }

      setShowAddModal(false)
      resetForm()

      // Recharger la liste
      const response = await axios.get(`/products/shop/${selectedShop}`)
      setProducts(response.data.products)
    } catch (error) {
      console.error('Erreur sauvegarde produit:', error)
      toast.error('Erreur lors de la sauvegarde du produit')
    }
  }

  const resetForm = () => {
    setNewProduct({ name: '', price: '', description: '', category: 'Vêtements', stock: '', shopId: '', collectionId: '' })
    setImageFiles([])
    setImagePreviews([])
    setIsEditing(false)
    setEditingId(null)
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
              onChange={(e) => {
                setSelectedShop(e.target.value)
                localStorage.setItem('selectedShopId', e.target.value)
              }}
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
            onClick={() => { resetForm(); setShowAddModal(true); }}
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
                            <img src={resolveImageUrl(product.image_url)} alt={product.name} className="h-full w-full object-cover" />
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
                        onClick={() => handleEditProduct(product)}
                        className="text-gray-400 hover:text-blue-600 transition-colors mr-2 p-2 hover:bg-blue-50 rounded-full"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
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
                className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-10 flex flex-col"
              >
                <div className="flex items-center justify-between px-8 py-6 border-b sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 -mr-2"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
                  <div className="overflow-y-auto flex-1">
                    <div className="p-8 space-y-6">

                      {/* Shopify-like Media Card */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-base font-bold text-gray-900">Médias (jusqu'à 5)</label>
                        </div>

                        {imagePreviews.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {imagePreviews.map((preview, idx) => (
                              <div key={idx} className={`relative rounded-xl overflow-hidden border border-gray-200 group ${idx === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                {idx === 0 && (
                                  <div className="absolute bottom-2 left-2 bg-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm border border-gray-100">
                                    Principale
                                  </div>
                                )}
                              </div>
                            ))}
                            {imagePreviews.length < 5 && (
                              <div className={`relative rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center ${imagePreviews.length === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                                <FiPlus className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-xs font-semibold text-gray-500">Ajouter</span>
                                <input
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageChange}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-xl relative cursor-pointer hover:border-primary-500 transition-colors bg-white hover:bg-gray-50 shadow-sm">
                            <div className="space-y-2 text-center pointer-events-none">
                              <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                              <div className="flex text-sm text-gray-600 justify-center">
                                <span className="relative rounded-md font-bold text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                  Ajouter des images
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">Accepte les images par glisser-déposer</p>
                            </div>
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                            />
                          </div>
                        )}
                        <p className="text-xs font-medium text-gray-500 mt-4 text-center">Recommandé: Images carrées (JPG, PNG)</p>
                      </div>

                      {/* Product Details Card */}
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-200">
                          <h4 className="text-base font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <FiBox className="w-4 h-4 text-primary-600" />
                            </div>
                            Détails du produit
                          </h4>
                        </div>

                        <div className="p-8 space-y-6">
                          {/* Name & Price Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-900">
                                Nom du produit <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                className="input-field text-base"
                                required
                                placeholder="Ex: T-shirt Premium Cotton"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-900">
                                Prix de vente <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  className="input-field text-base pl-16"
                                  required
                                  placeholder="0.00"
                                  value={newProduct.price}
                                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-sm">XOF</span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-semibold text-gray-900">Description du produit</label>
                              <button
                                type="button"
                                onClick={handleGenerateDescription}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all border border-purple-200 hover:border-purple-300"
                              >
                                <FiCpu className="w-4 h-4" />
                                Générer avec l'IA
                              </button>
                            </div>
                            <textarea
                              rows={5}
                              className="input-field resize-none text-base"
                              placeholder="Décrivez les caractéristiques, matériaux, tailles disponibles..."
                              value={newProduct.description}
                              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Category & Stock Card */}
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-200">
                          <h4 className="text-base font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <FiFilter className="w-4 h-4 text-primary-600" />
                            </div>
                            Organisation & Stock
                          </h4>
                        </div>

                        <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-900">Catégorie</label>
                              <select
                                className="input-field text-base cursor-pointer"
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                              >
                                <option value="Vêtements">👕 Vêtements</option>
                                <option value="Électronique">📱 Électronique</option>
                                <option value="Maison">🏠 Maison & Décoration</option>
                                <option value="Beauté">💄 Beauté & Cosmétiques</option>
                                <option value="Accessoires">👜 Accessoires</option>
                                <option value="Sport">⚽ Sport & Loisirs</option>
                                <option value="Autres">📦 Autres</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-900">
                                Quantité en stock <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                className="input-field text-base"
                                required
                                placeholder="0"
                                min="0"
                                value={newProduct.stock}
                                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* [NEW] Collection Selection */}
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-900 mb-1">Collection (Optionnel)</label>
                            <select
                              className="input-field text-base cursor-pointer"
                              value={newProduct.collectionId}
                              onChange={e => setNewProduct({ ...newProduct, collectionId: e.target.value })}
                            >
                              <option value="">-- Aucune --</option>
                              {collections.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-gray-200 bg-gray-50 px-8 py-5 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 text-base font-medium"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="px-8 py-3 text-base font-bold shadow-lg"
                    >
                      {isEditing ? '💾 Sauvegarder les modifications' : '✨ Ajouter le produit'}
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
