import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { FiEye, FiCheck, FiX, FiTruck, FiSearch, FiLoader, FiPackage, FiDollarSign, FiClock, FiDownload } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/currency'
import Button from '../../components/ui/Button'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const { token } = useAuthStore()

  // ... (Configuration Axios & Effects unchanged)

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast.error("Aucune commande à exporter")
      return
    }

    // Formatage des données pour Excel
    const data = filteredOrders.map(order => ({
      "Numéro": order.order_number,
      "Date": new Date(order.created_at).toLocaleDateString(),
      "Client": order.customer?.name || 'Anonyme',
      "Téléphone": order.customer?.phone || '',
      "Statut": getStatusText(order.status),
      "Total": `${order.total_amount} ${order.currency || 'XOF'}`,
      "Adresse": typeof order.shipping_address === 'string' ? order.shipping_address : (JSON.stringify(order.shipping_address) || '')
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes")

    // Générer le fichier
    XLSX.writeFile(workbook, `Commandes_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success("Exportation réussie !")
  }

  // ... (fetchOrders, other functions unchanged)

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

          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <FiDownload className="w-4 h-4" /> Exporter
          </Button>
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
