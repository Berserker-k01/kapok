import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Package, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Loader } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { useAuthStore } from '../../store/authStore';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
  <Card>
    <CardBody className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-500">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend === 'up' ? (
          <span className="text-green-600 flex items-center font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            {trendValue}
          </span>
        ) : (
          <span className="text-red-600 flex items-center font-medium">
            <ArrowDownRight size={16} className="mr-1" />
            {trendValue}
          </span>
        )}
        <span className="text-secondary-400 ml-2">vs mois dernier</span>
      </div>
    </CardBody>
  </Card>
);

const ActivityItem = ({ title, time, type }) => (
  <div className="flex items-start space-x-3 py-3 border-b border-secondary-100 last:border-0">
    <div className={`mt-1 w-2 h-2 rounded-full ${type === 'order' ? 'bg-green-500' :
      type === 'product' ? 'bg-blue-500' : 'bg-yellow-500'
      }`} />
    <div>
      <p className="text-sm font-medium text-secondary-900">{title}</p>
      <div className="flex items-center mt-1 text-xs text-secondary-500">
        <Clock size={12} className="mr-1" />
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
    totalShops: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shops, setShops] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Récupérer les boutiques
        const shopsRes = await axios.get('/shops');

        // CORRECTION ROBUSTE: Gérer les deux formats (Admin vs User)
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
      // Stats Produits
      const productsRes = await axios.get(`/products/shop/${shopId}`);
      // CORRECTION: productsRes.data.products (comme dans Products.jsx)
      const products = productsRes.data?.products || [];

      // Stats Commandes
      const ordersRes = await axios.get(`/orders/shop/${shopId}`);
      // CORRECTION: ordersRes.data.orders (comme dans Orders.jsx)
      const orders = ordersRes.data?.orders || [];

      // Calculs
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalShops: shops.length, // Global
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (e) => {
    const shopId = e.target.value;
    const shop = shops.find(s => s.id === shopId);
    setSelectedShop(shop);
    fetchStats(shopId);
  };

  if (loading && !stats.totalRevenue && !selectedShop) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tableau de bord</h1>
          <p className="text-secondary-500 mt-1">Vue d'ensemble de vos activités</p>
        </div>
        {shops.length > 0 && (
          <select
            className="border border-gray-300 rounded-md px-3 py-2 bg-white w-full md:w-auto"
            value={selectedShop?.id}
            onChange={handleShopChange}
          >
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
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
          color="bg-purple-600"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          trend="up"
          trendValue="+0%"
          icon={ShoppingCart}
          color="bg-blue-600"
        />
        <StatCard
          title="Produits Actifs"
          value={stats.totalProducts}
          trend="down"
          trendValue="+0%"
          icon={Package}
          color="bg-orange-500"
        />
        <StatCard
          title="Boutiques"
          value={stats.totalShops}
          trend="up"
          trendValue="+0%"
          icon={Store}
          color="bg-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center bg-secondary-50">
            <h2 className="font-semibold text-secondary-900">Dernières Commandes</h2>
            <Badge variant="primary">Total: {stats.recentOrders.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-secondary-500 uppercase bg-secondary-50">
                <tr>
                  <th className="px-6 py-3">ID Commande</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Montant</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="px-6 py-4 font-medium">{order.order_number}</td>
                    <td className="px-6 py-4">{order.customer?.name || 'Anonyme'}</td>
                    <td className="px-6 py-4">{formatCurrency(order.total_amount, order.currency)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Aucune commande récente</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity (Placeholder pour l'instant) */}
        <Card>
          <div className="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
            <h2 className="font-semibold text-secondary-900">Activité Récente</h2>
          </div>
          <CardBody>
            <div className="space-y-2">
              <ActivityItem title="Bienvenue sur votre dashboard" time="A l'instant" type="shop" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
