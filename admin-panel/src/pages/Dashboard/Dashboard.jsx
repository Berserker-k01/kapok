import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Store, CreditCard, TrendingUp, ArrowUpRight, AlertCircle, Loader } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
  <Card>
    <CardBody className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Trend désactivé pour l'instant car pas de données historiques précises */}
      {/* <div className="mt-4 flex items-center text-sm">
        <span className="text-green-600 flex items-center font-medium">
          <ArrowUpRight size={16} className="mr-1" />
          {trendValue}
        </span>
        <span className="text-secondary-400 ml-2">vs mois dernier</span>
      </div> */}
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/admin/dashboard');
        setStats(response.data.stats);
      } catch (error) {
        console.error("Erreur chargement dashboard admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-96"><Loader className="animate-spin" /></div>;
  if (!stats) return <div className="text-center p-10">Erreur de chargement des données.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Vue d'ensemble</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1">Monitoring global de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus Totaux"
          value={`${parseFloat(stats.total_revenue).toLocaleString()} €`} // Devise à adapter
          trend="up"
          trendValue="+0%"
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatCard
          title="Utilisateurs Actifs"
          value={stats.active_users}
          trend="up"
          trendValue="+0%"
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Boutiques Créées"
          value={stats.total_shops}
          trend="up"
          trendValue="+0%"
          icon={Store}
          color="bg-purple-600"
        />
        <StatCard
          title="Commandes Totales"
          value={stats.total_orders}
          trend="up"
          trendValue="+0%"
          icon={CreditCard}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shops (Placeholder amélioré) */}
        <Card>
          <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center bg-secondary-50">
            <h2 className="font-semibold text-secondary-900">Activité Récente</h2>
            <Badge variant="info">Info</Badge>
          </div>
          <CardBody>
            <p className="text-secondary-500 text-center py-4">Les données détaillées arrivent bientôt.</p>
          </CardBody>
        </Card>

        {/* Alerts / Moderation */}
        <Card>
          <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 flex justify-between items-center bg-secondary-50 dark:bg-secondary-800/50">
            <h2 className="font-semibold text-secondary-900 dark:text-white">Alertes & Modération</h2>
            <Badge variant="success">Tout va bien</Badge>
          </div>
          <CardBody>
            <div className="text-center py-8 text-secondary-500 dark:text-secondary-400">
              <AlertCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p>Aucune alerte critique pour le moment.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
