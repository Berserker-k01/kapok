import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const Analytics = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/admin/dashboard')
        const growth = response.data.monthlyGrowth

        // Formatter les données pour le graphique
        const formattedData = growth.map(item => ({
          name: format(new Date(item.month), 'MMM', { locale: fr }),
          users: parseInt(item.new_users),
          shops: parseInt(item.new_shops),
          revenue: parseFloat(item.total_revenue)
        })).reverse() // On veut du plus ancien au plus récent

        setData(formattedData)
      } catch (error) {
        console.error('Erreur chargement analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="p-8 text-center">Chargement des données...</div>

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
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Nouveaux Utilisateurs" />
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
              <Tooltip formatter={(value) => `${value} FCFA`} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenus" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
