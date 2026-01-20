import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Store, Package, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Loader, Users, ChevronDown, Check, Activity, BarChart2, PieChart as PieChartIcon } from 'lucide-react'
import { Card, CardBody } from '../../components/ui/Card'
import { formatCurrency } from '../../utils/currency'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <Card className="transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
    <CardBody className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${gradient} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-secondary-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-black text-secondary-900 tracking-tight">{value}</h3>
      </div>
    </CardBody>
  </Card>
);

const Analytics = () => {
  const [shops, setShops] = useState([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Selector State
  const [isShopSelectorOpen, setIsShopSelectorOpen] = useState(false)
  const selectorRef = useRef(null)

  // 1. Récupérer les boutiques de l'utilisateur
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('/shops')
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

  // Close selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsShopSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // 2. Récupérer les stats quand une boutique est sélectionnée
  useEffect(() => {
    if (!selectedShopId) return

    // Fermer le sélecteur quand on change (au cas où)
    setIsShopSelectorOpen(false);

    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/shops/${selectedShopId}/stats`)
        setData(response.data.data)
      } catch (error) {
        console.error("Erreur chargement stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [selectedShopId])

  if (loading && !data) return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-primary-600" /></div>;

  if (shops.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center space-y-4">
        <Store size={48} className="text-gray-300" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Aucune boutique</h2>
          <p className="text-gray-500 mt-1">Créez votre première boutique pour accéder aux statistiques.</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const selectedShop = shops.find(s => s.id === selectedShopId);

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
    <div className="space-y-8 animate-fade-in">
      {/* Header & Shop Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Analytics</h1>
          <p className="text-secondary-500 mt-1 font-medium">Performances détaillées de vos boutiques</p>
        </div>

        {/* Custom Shop Selector */}
        <div className="relative z-20" ref={selectorRef}>
          <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
            Boutique analysée
          </label>
          <button
            onClick={() => setIsShopSelectorOpen(!isShopSelectorOpen)}
            className="flex items-center justify-between w-full md:w-64 px-4 py-2.5 bg-white border border-secondary-200 rounded-xl shadow-sm hover:border-primary-500 hover:ring-2 hover:ring-primary-100 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                <Store size={16} />
              </div>
              <span className="font-semibold text-gray-900 truncate">{selectedShop?.name || 'Sélectionner'}</span>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isShopSelectorOpen ? 'rotate-180' : ''}`} />
          </button>

          {isShopSelectorOpen && (
            <div className="absolute right-0 mt-2 w-full md:w-72 bg-white rounded-xl shadow-xl border border-secondary-100 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 text-xs font-bold text-secondary-400 uppercase tracking-wider border-b border-secondary-50 mb-1">
                Changer de boutique
              </div>
              {shops.map(shop => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors
                      ${selectedShopId === shop.id ? 'bg-primary-50/50' : ''}
                    `}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 font-bold text-sm
                        ${selectedShopId === shop.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                      `}>
                      {shop.name.charAt(0)}
                    </div>
                    <span className={`font-medium ${selectedShopId === shop.id ? 'text-primary-900' : 'text-gray-700'}`}>
                      {shop.name}
                    </span>
                  </div>
                  {selectedShopId === shop.id && <Check size={18} className="text-primary-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Revenus Totaux"
          value={formatCurrency(data.stats.total_revenue)}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-200"
        />
        <StatCard
          title="Commandes Totales"
          value={data.stats.total_orders}
          icon={ShoppingCart}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200"
        />
        <StatCard
          title="Produits en ligne"
          value={data.stats.total_products}
          icon={Package}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200"
        />
        <StatCard
          title="Commandes (30j)"
          value={data.stats.orders_last_30_days}
          icon={Activity}
          gradient="bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-200"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Evolution */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-100">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-500" />
                Évolution du Chiffre d'Affaires
              </h3>
            </div>
          </div>
          <CardBody>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} FCFA`, 'Ventes']}
                  />
                  <Line type="monotone" dataKey="ventes" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Orders Count */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-100">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-500" />
                Volume de Commandes
              </h3>
            </div>
          </div>
          <CardBody>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="commandes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-100">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon size={18} className="text-orange-500" />
              Ventes par Catégorie
            </h3>
          </div>
          <CardBody>
            <div className="h-[300px] w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <PieChartIcon size={32} className="mb-2 opacity-20" />
                  <span className="text-sm">Pas assez de données</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Top Products */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-100">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-green-500" />
              Top Produits
            </h3>
          </div>
          <CardBody>
            <div className="space-y-3">
              {data.topProducts.length > 0 ? (
                data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 font-bold border border-gray-100 shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 truncate max-w-[150px]">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} ventes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{parseFloat(product.revenue).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-10">Aucune vente enregistrée</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border-0 ring-1 ring-gray-100">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-gray-400" />
            Activité Récente
          </h3>
        </div>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-50">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.details}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    {format(new Date(activity.time), 'dd MMM HH:mm', { locale: fr })}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">Aucune activité récente</div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default Analytics
