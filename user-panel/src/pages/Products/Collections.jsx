import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiImage, FiSearch, FiLoader, FiLayers, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

const Collections = () => {
    const [collections, setCollections] = useState([])
    const [shops, setShops] = useState([])
    const [selectedShop, setSelectedShop] = useState('')
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: ''
    })

    // Mock Shops (Replace with actual fetch if context not available)
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

    // Fetch Collections
    useEffect(() => {
        const fetchCollections = async () => {
            if (!selectedShop) return

            setLoading(true)
            try {
                // Assuming route: /api/collections?shop_id=... or /api/shops/:id/collections
                // Based on my implementation: GET /api/collections?shopId=... is not standard in controller
                // Controller uses: getCollectionsByShop taking req.params.shopId
                // Route was: router.route('/').get(collectionController.getShopCollections)
                // Wait, route was: router.route('/').get(collectionController.getShopCollections)
                // But getShopCollections uses req.params.shopId. 
                // If I call /api/collections, req.params.shopId is undefined.
                // FIX: I need to update the route or the controller to handle query param or body.
                // Let's assum I'll fix the route/controller quickly. Or use the correct path if nested.
                // Route collections.js has `const router = express.Router({ mergeParams: true });`
                // But it's mounted at `/api/collections` in index.js. 
                // So `shopId` param is NOT available unless I mount it at `/api/shops/:shopId/collections`.
                // OR I update controller to check `req.query.shopId`.

                // Let's try passing shopId in query for now and fix controller next step if needed.
                // Actually, let's fix the controller logic in my head: 
                // "const shopId = req.body.shopId || req.params.shopId;" -> This was createCollection.
                // getShopCollections used: "req.params.shopId".
                // This will fail if called from /api/collections directly without param.

                // TEMP FIX: I will use a query param `?shop_id=` and update the controller to read it 
                // OR easier: I'll use `axios.get('/collections', { params: { shopId: selectedShop } })`
                // knowing I need to patch the controller to look at `req.query.shopId`.

                const response = await axios.get('/collections', { params: { shopId: selectedShop } })
                // Note: I will update controller to support req.query.shopId

                setCollections(response.data.data.collections)
            } catch (error) {
                console.error('Erreur chargement collections:', error)
                // toast.error('Impossible de charger les collections')
            } finally {
                setLoading(false)
            }
        }

        fetchCollections()
    }, [selectedShop])


    const handleSubmit = async (e) => {
        e.preventDefault()

        // Auto-generate basics
        const payload = {
            ...formData,
            shopId: selectedShop
        }

        try {
            if (isEditing) {
                await axios.put(`/collections/${editingId}`, payload)
                toast.success('Collection modifiée')
            } else {
                await axios.post('/collections', payload)
                toast.success('Collection créée')
            }

            setShowModal(false)
            setFormData({ name: '', description: '', image_url: '' })
            setIsEditing(false)

            // Refresh
            const response = await axios.get('/collections', { params: { shopId: selectedShop } })
            setCollections(response.data.data.collections)

        } catch (error) {
            console.error(error)
            toast.error('Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette collection ?')) return
        try {
            await axios.delete(`/collections/${id}`)
            setCollections(collections.filter(c => c.id !== id))
            toast.success('Collection supprimée')
        } catch (error) {
            toast.error('Erreur suppression')
        }
    }

    const handleEdit = (col) => {
        setFormData({
            name: col.name,
            description: col.description || '',
            image_url: col.image_url || ''
        })
        setEditingId(col.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                        <FiLayers className="text-primary-600" /> Collections
                    </h1>
                    <p className="text-muted-foreground">Regroupez vos produits (ex: Été, Promotions, Nouveautés)</p>
                </div>

                <div className="flex items-center gap-3">
                    {shops.length > 0 && (
                        <select
                            value={selectedShop}
                            onChange={(e) => setSelectedShop(e.target.value)}
                            className="input-field w-48"
                        >
                            {shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                        </select>
                    )}

                    <Button onClick={() => { setIsEditing(false); setFormData({ name: '', description: '', image_url: '' }); setShowModal(true) }}>
                        <FiPlus className="mr-2" /> Créer une collection
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="card">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une collection..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center"><FiLoader className="animate-spin h-8 w-8 mx-auto text-primary-500" /></td></tr>
                            ) : filteredCollections.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Aucune collection trouvée.</td></tr>
                            ) : (
                                filteredCollections.map(col => (
                                    <tr key={col.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                                    {col.image_url ? <img src={col.image_url} alt="" className="h-full w-full object-cover" /> : <FiLayers className="text-gray-400" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{col.name}</div>
                                                    <div className="text-xs text-gray-500">{col.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {col.product_count || 0} produits
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            /{col.slug}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(col)} className="text-gray-400 hover:text-blue-600"><FiEdit /></button>
                                            <button onClick={() => handleDelete(col.id)} className="text-gray-400 hover:text-red-600"><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg">{isEditing ? 'Modifier la collection' : 'Nouvelle collection'}</h3>
                                <button onClick={() => setShowModal(false)}><FiX size={20} className="text-gray-500 hover:text-gray-700" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la collection</label>
                                    <input
                                        required
                                        className="input-field"
                                        placeholder="Ex: Soldes d'été"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optionnel)</label>
                                    <textarea
                                        className="input-field"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image (Optionnel)</label>
                                    <input
                                        className="input-field"
                                        placeholder="https://..."
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button type="submit">{isEditing ? 'Sauvegarder' : 'Créer'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Collections
