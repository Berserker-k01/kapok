import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiEye, FiCheck, FiX, FiTruck, FiSearch, FiLoader, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/currency'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const { token } = useAuthStore()

  // Configuration Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  // Charger les boutiques
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/shops')
        setShops(response.data.shops)
        if (response.data.shops.length > 0) {
          setSelectedShop(response.data.shops[0].id)
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

  // Charger les commandes
  const fetchOrders = async () => {
    if (!selectedShop) return

    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/shop/${selectedShop}`)
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
      toast.error('Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [selectedShop])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Commande ${newStatus === 'confirmed' ? 'confirmée' : newStatus === 'shipped' ? 'expédiée' : 'mise à jour'}`)
      fetchOrders() // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      toast.error('Impossible de mettre à jour le statut')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'validated_by_customer': return 'bg-teal-100 text-teal-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'processing': return 'En préparation'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      case 'validated_by_customer': return 'Validée par client'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Calcul des stats
  const stats = [
    {
      title: 'Total Commandes',
      value: orders.length,
      icon: <FiPackage className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'En attente',
      value: orders.filter(o => o.status === 'pending').length,
      icon: <FiClock className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Revenus (Validés)',
      value: `${orders
        .filter(o => ['delivered', 'validated_by_customer'].includes(o.status))
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
        .toFixed(2)} ${orders[0]?.currency || 'XOF'}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    }
  ]

  if (loading && shops.length === 0) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Commandes</h1>
          <p className="text-muted-foreground">Gérez et suivez vos commandes</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher (N°, Client, Email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FiLoader className="w-8 h-8 mx-auto animate-spin text-primary-600" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.order_number || order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer?.name || 'Client inconnu'}</div>
                      <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount, order.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                              title="Confirmer"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                              title="Annuler"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Expédier"
                          >
                            <FiTruck className="h-5 w-5" />
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="text-green-600 hover:text-green-900"
                            title="Marquer comme livré"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Orders
