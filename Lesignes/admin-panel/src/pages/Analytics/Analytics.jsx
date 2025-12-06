import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Analytics = () => {
  const data = [
    { name: 'Jan', users: 400, shops: 240, revenue: 2400 },
    { name: 'Fév', users: 300, shops: 139, revenue: 2210 },
    { name: 'Mar', users: 200, shops: 980, revenue: 2290 },
    { name: 'Avr', users: 278, shops: 390, revenue: 2000 },
    { name: 'Mai', users: 189, shops: 480, revenue: 2181 },
    { name: 'Jun', users: 239, shops: 380, revenue: 2500 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Plateforme</h1>
        <p className="text-gray-600">Analysez les performances globales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance Utilisateurs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus Mensuels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
