import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Store, Package, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Loader, Users, ChevronDown, Check, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { useAuthStore } from '../../store/authStore';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, gradient }) => (
  <Card className="transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
    <CardBody className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${gradient} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-secondary-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-black text-secondary-900 tracking-tight">{value}</h3>
      </div>
    </CardBody>
  </Card>
);

const ActivityItem = ({ title, time, type }) => (
  <div className="flex items-start space-x-4 py-4 border-b border-secondary-50 last:border-0 hover:bg-gray-50/50 p-3 rounded-xl transition-colors group">
    <div className={`mt-1.5 w-2 h-2 rounded-full ring-4 ring-opacity-20 transition-all duration-300 group-hover:ring-8 ${type === 'order' ? 'bg-green-500 ring-green-500' :
      type === 'product' ? 'bg-blue-500 ring-blue-500' : 'bg-yellow-500 ring-yellow-500'
      }`} />
    <div>
      <p className="text-sm font-bold text-secondary-900">{title}</p>
      <div className="flex items-center mt-1.5 text-xs text-secondary-400 font-medium">
        <Clock size={12} className="mr-1.5" />
        {time}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [isShopSelectorOpen, setIsShopSelectorOpen] = useState(false);
  const selectorRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Récupérer les boutiques
        const shopsRes = await axios.get('/shops');
        const shopsData = shopsRes.data.shops || shopsRes.data.data?.shops || [];
        setShops(shopsData);

        if (shopsData.length > 0) {
          const firstShop = shopsData[0];
          setSelectedShop(firstShop);
          await fetchStats(firstShop.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchStats = async (shopId) => {
    setLoading(true);
    try {
      const productsRes = await axios.get(`/products/shop/${shopId}`);
      const products = productsRes.data?.products || [];

      const ordersRes = await axios.get(`/orders/shop/${shopId}`);
      const orders = ordersRes.data?.orders || [];

      // Calculs
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      // Calcul Clients Uniques (Basique pour l'instant, basé sur les noms de clients dans les commandes)
      const uniqueCustomers = new Set(orders.map(o => o.customer?.name || o.customer_id).filter(Boolean)).size;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: uniqueCustomers,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (shop) => {
    setSelectedShop(shop);
    setIsShopSelectorOpen(false);
    fetchStats(shop.id);
  };

  if (loading && !stats.totalRevenue && !selectedShop) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Tableau de bord</h1>
          <p className="text-secondary-500 mt-1 font-medium">Vue d'ensemble de vos activités</p>
        </div>

        {/* Custom Shop Selector */}
        {shops.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!selectedShop?.slug) return;
                const url = `${window.location.origin}/s/${selectedShop.slug}`;
                navigator.clipboard.writeText(url);
                // Simple toast feedback (assuming toast is available in scope or needs import)
                // Since toast is not imported in original snippet, we might need to add it or use window alert for now, 
                // BUT toast is often globally available or easy to import if established.
                // Checking imports: toast is NOT imported in Dashboard.jsx. adding it now would require changing imports.
                // Let's use a temporary visual feedback or assume I can add toast import in a previous block?
                // No, replace_file_content modifies a block. I should do a bigger replace or just use a simple alert/console for now?
                // Wait, Dashboard.jsx normally imports toast? No, it imports axios, icons, Card, etc.
                // Let's rely on a simple visual change or native alert for this step, 
                // OR better: I will add `import toast from 'react-hot-toast'` in a separate edit if needed.
                // Actually, let's just use `alert` for safety in this step or trust `toast` if I add it. 
                // I will add the import in a separate call or assume user has it.
                // Let's stick to adding the button UI first.
                // I'll add the button and use a simple logic.
                // Re-reading context: Dashboard.jsx does NOT have toast. I will add it.
                /* I will add the import in a subsequent edit or relying on a larger block replace */
              }}
              className="p-2.5 bg-white border border-secondary-200 rounded-xl shadow-sm text-secondary-500 hover:text-primary-600 hover:border-primary-500 transition-all flex items-center justify-center relative group"
              title="Copier le lien de la boutique"
            >
              <Link2 size={18} />
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Copier le lien
              </span>
            </button>

            <div className="relative z-20" ref={selectorRef}>
              <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
                Boutique active
              </label>
              <button
                onClick={() => setIsShopSelectorOpen(!isShopSelectorOpen)}
                className="flex items-center justify-between w-full md:w-64 px-4 py-2.5 bg-white border border-secondary-200 rounded-xl shadow-sm hover:border-primary-500 hover:ring-2 hover:ring-primary-100 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                    <Store size={16} />
                  </div>
                  <span className="font-semibold text-gray-900 truncate">{selectedShop?.name}</span>
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
                      onClick={() => handleShopChange(shop)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors
                        ${selectedShop?.id === shop.id ? 'bg-primary-50/50' : ''}
                      `}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 font-bold text-sm
                          ${selectedShop?.id === shop.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {shop.name.charAt(0)}
                        </div>
                        <span className={`font-medium ${selectedShop?.id === shop.id ? 'text-primary-900' : 'text-gray-700'}`}>
                          {shop.name}
                        </span>
                      </div>
                      {selectedShop?.id === shop.id && <Check size={18} className="text-primary-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus Totaux"
          value={formatCurrency(stats.totalRevenue, selectedShop?.currency || 'XOF')}
          trend="up"
          trendValue="+0%"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-200"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          trend="up"
          trendValue="+0%"
          icon={ShoppingCart}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200"
        />
        <StatCard
          title="Produits Actifs"
          value={stats.totalProducts}
          trend="down"
          trendValue="+0%"
          icon={Package}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200"
        />
        {/* Changed from 'Boutiques' to 'Clients' to be relevant for single-shop context */}
        <StatCard
          title="Clients Uniques"
          value={stats.totalCustomers}
          trend="up"
          trendValue="+0%"
          icon={Users}
          gradient="bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 shadow-sm">
          <div className="px-6 py-5 border-b border-secondary-100 flex justify-between items-center bg-white rounded-t-xl">
            <h2 className="font-bold text-secondary-900 flex items-center">
              <ShoppingCart size={18} className="mr-2 text-secondary-400" />
              Dernières Commandes
            </h2>
            <Badge variant="primary" className="rounded-full px-3">Total: {stats.recentOrders.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-secondary-500 uppercase bg-secondary-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID Commande</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Montant</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary-600">#{order.order_number}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer?.name || 'Client Web'}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{formatCurrency(order.total_amount, order.currency)}</td>
                    <td className="px-6 py-4">
                      <Badge className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide"
                        variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart size={40} className="mb-3 text-gray-200" />
                        <p>Aucune commande récente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm h-full">
          <div className="px-6 py-5 border-b border-secondary-100 bg-white rounded-t-xl">
            <h2 className="font-bold text-secondary-900 flex items-center">
              <Clock size={18} className="mr-2 text-secondary-400" />
              Activité Récente
            </h2>
          </div>
          <CardBody className="p-0">
            <div className="divide-y divide-secondary-50">
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Store size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Bienvenue</p>
                    <p className="text-xs text-gray-500">Tableau de bord prêt pour {selectedShop?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
