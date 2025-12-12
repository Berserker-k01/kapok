import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiSave } from 'react-icons/fi'

const Settings = () => {
  const [settings, setSettings] = useState({
    platform_name: '',
    support_email: '',
    free_plan_shops_limit: '',
    free_plan_products_limit: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/admin/settings')
        setSettings(prev => ({ ...prev, ...response.data.settings }))
      } catch (error) {
        console.error('Erreur chargement paramètres:', error)
        toast.error('Impossible de charger les paramètres')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put('/api/admin/settings', settings)
      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Impossible de sauvegarder les paramètres')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres Administrateur</h1>
        <p className="text-gray-600">Configuration de la plateforme</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Générale</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la plateforme</label>
              <input
                type="text"
                name="platform_name"
                value={settings.platform_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email support</label>
              <input
                type="email"
                name="support_email"
                value={settings.support_email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites Plateforme (Plan Gratuit)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boutiques gratuites par utilisateur</label>
              <input
                type="number"
                name="free_plan_shops_limit"
                value={settings.free_plan_shops_limit}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produits max par boutique gratuite</label>
              <input
                type="number"
                name="free_plan_products_limit"
                value={settings.free_plan_products_limit}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center"
          >
            <FiSave className="mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
