import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const Analytics = () => {
  const salesData = [
    { name: 'Jan', ventes: 4000, visiteurs: 2400 },
    { name: 'Fév', ventes: 3000, visiteurs: 1398 },
    { name: 'Mar', ventes: 2000, visiteurs: 9800 },
    { name: 'Avr', ventes: 2780, visiteurs: 3908 },
    { name: 'Mai', ventes: 1890, visiteurs: 4800 },
    { name: 'Jun', ventes: 2390, visiteurs: 3800 },
  ]

  const categoryData = [
    { name: 'Vêtements', value: 400, color: '#3b82f6' },
    { name: 'Électronique', value: 300, color: '#10b981' },
    { name: 'Maison', value: 200, color: '#f59e0b' },
    { name: 'Sport', value: 100, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Analysez les performances de vos boutiques</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">2,450€</p>
            <p className="text-sm text-gray-600">Revenus ce mois</p>
            <p className="text-xs text-green-600">+15% vs mois dernier</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">1,234</p>
            <p className="text-sm text-gray-600">Visiteurs uniques</p>
            <p className="text-xs text-green-600">+8% vs mois dernier</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">3.2%</p>
            <p className="text-sm text-gray-600">Taux de conversion</p>
            <p className="text-xs text-red-600">-0.5% vs mois dernier</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">45€</p>
            <p className="text-sm text-gray-600">Panier moyen</p>
            <p className="text-xs text-green-600">+12% vs mois dernier</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Evolution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trafic Visiteurs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visiteurs" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les Plus Vendus</h3>
          <div className="space-y-4">
            {[
              { name: 'T-shirt Blanc Premium', sales: 45, revenue: '1,125€' },
              { name: 'Pantalon Noir Slim', sales: 32, revenue: '1,470€' },
              { name: 'Smartphone Pro Max', sales: 8, revenue: '7,200€' },
              { name: 'Robe Été Fleurie', sales: 28, revenue: '1,820€' },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} ventes</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {[
            { action: 'Nouvelle commande', details: 'Marie Dubois - T-shirt Blanc', time: 'Il y a 2h' },
            { action: 'Produit ajouté', details: 'Smartphone Pro Max', time: 'Il y a 4h' },
            { action: 'Commande livrée', details: 'Jean Martin - Pantalon Noir', time: 'Il y a 6h' },
            { action: 'Nouveau visiteur', details: 'Via Google Search', time: 'Il y a 8h' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.details}</p>
              </div>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics
