import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const [shops, setShops] = useState([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Récupérer les boutiques de l'utilisateur
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('/api/shops')
        const shopsList = response.data.data.shops
        setShops(shopsList)
        if (shopsList.length > 0) {
          setSelectedShopId(shopsList[0].id)
        } else {
          setLoading(false) // Pas de boutique, fin de chargement
        }
      } catch (error) {
        console.error("Erreur chargement boutiques", error)
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  // 2. Récupérer les stats quand une boutique est sélectionnée
  useEffect(() => {
    if (!selectedShopId) return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/shops/${selectedShopId}/stats`)
        setData(response.data.data)
      } catch (error) {
        console.error("Erreur chargement stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [selectedShopId])

  if (loading) return <div className="flex h-96 items-center justify-center">Chargement des données...</div>

  if (shops.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold mb-2">Aucune donnée disponible</h2>
        <p className="text-gray-500">Vous devez d'abord créer une boutique pour voir des statistiques.</p>
      </div>
    )
  }

  if (!data) return null

  // Formatage des données pour les graphiques
  const salesChartData = data.monthlySales.map(item => ({
    name: format(new Date(item.month), 'MMM', { locale: fr }),
    ventes: parseFloat(item.revenue),
    commandes: parseInt(item.orders)
  })).reverse()

  const categoryChartData = data.categorySales.map((item, index) => ({
    name: item.name || 'Non classé',
    value: parseFloat(item.value),
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header & Shop Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Analysez les performances de vos boutiques</p>
        </div>

        <select
          value={selectedShopId}
          onChange={(e) => setSelectedShopId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {shops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{parseFloat(data.stats.total_revenue).toLocaleString('fr-FR')} FCFA</p>
            <p className="text-sm text-gray-600">Revenus Totaux</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{data.stats.total_orders}</p>
            <p className="text-sm text-gray-600">Commandes Totales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{data.stats.total_products}</p>
            <p className="text-sm text-gray-600">Produits en ligne</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{data.stats.orders_last_30_days}</p>
            <p className="text-sm text-gray-600">Commandes (30j)</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Evolution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du Chiffre d'Affaires</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} FCFA`} />
                <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} name="Ventes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Count */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume de Commandes</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#10b981" name="Commandes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par Catégorie</h3>
          <div className="h-[300px] w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">Pas assez de données</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les Plus Vendus</h3>
          <div className="space-y-4">
            {data.topProducts.length > 0 ? (
              data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} ventes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{parseFloat(product.revenue).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-10">Aucune vente enregistrée</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {data.recentActivity.length > 0 ? (
            data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <p className="text-xs text-gray-400">{format(new Date(activity.time), 'dd MMM HH:mm', { locale: fr })}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">Aucune activité récente</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
