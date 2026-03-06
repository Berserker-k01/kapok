import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FiSave, FiUser, FiLock, FiMail, FiSettings, FiShield, FiEye, FiEyeOff } from 'react-icons/fi'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'

const Settings = () => {
  const { user, updateUser } = useAuthStore()

  // --- État des paramètres plateforme ---
  const [settings, setSettings] = useState({
    platform_name: '',
    support_email: '',
    free_plan_shops_limit: '',
    free_plan_products_limit: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // --- État du profil admin ---
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // --- État du mot de passe ---
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/admin/settings')
        setSettings(prev => ({ ...prev, ...response.data.settings }))
      } catch (error) {
        console.error('Erreur chargement paramètres:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Charger le profil depuis le store
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  // --- Sauvegarder les paramètres plateforme ---
  const handleSubmitSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put('/admin/settings', settings)
      toast.success('Paramètres de la plateforme sauvegardés')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Impossible de sauvegarder les paramètres')
    } finally {
      setSaving(false)
    }
  }

  // --- Sauvegarder le profil admin ---
  const handleSubmitProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const response = await axios.put('/admin/profile', {
        name: profile.name,
        email: profile.email
      })
      updateUser(response.data.admin)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      const msg = error.response?.data?.error || 'Impossible de mettre à jour le profil'
      toast.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  // --- Changer le mot de passe ---
  const handleSubmitPassword = async (e) => {
    e.preventDefault()

    if (passwords.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit faire au moins 6 caractères')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setSavingPassword(true)
    try {
      await axios.put('/admin/profile', {
        password: passwords.newPassword
      })
      toast.success('Mot de passe changé avec succès')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      const msg = error.response?.data?.error || 'Impossible de changer le mot de passe'
      toast.error(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="flex justify-center items-center h-96">Chargement...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre profil et la configuration de la plateforme</p>
      </div>

      {/* ============================================ */}
      {/* SECTION 1 : Profil Super Administrateur */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profil Administrateur</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modifiez vos informations personnelles</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FiMail className="inline w-4 h-4 mr-1" />
                  Adresse email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiShield className="w-4 h-4 text-green-500" />
                <span>Rôle : <strong className="text-gray-700 dark:text-gray-300">{user?.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur'}</strong></span>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {savingProfile ? 'Sauvegarde...' : 'Mettre à jour le profil'}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* ============================================ */}
      {/* SECTION 2 : Changer le mot de passe */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FiLock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sécurité du compte</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Changez votre mot de passe de connexion</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow pr-10"
                  placeholder="Min. 6 caractères"
                  required
                />
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  {showPasswords.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow pr-10"
                  placeholder="Répétez le mot de passe"
                  required
                />
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  {showPasswords.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full bg-amber-600 text-white px-5 py-2.5 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiLock className="w-4 h-4" />
                  {savingPassword ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </div>
            </div>
            {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-red-500 text-sm">⚠️ Les mots de passe ne correspondent pas</p>
            )}
          </form>
        </CardBody>
      </Card>

      {/* ============================================ */}
      {/* SECTION 3 : Configuration Plateforme */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiSettings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration de la plateforme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paramètres globaux d'Assimε</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmitSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la plateforme</label>
                <input
                  type="text"
                  name="platform_name"
                  value={settings.platform_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  placeholder="Assimε"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email du support</label>
                <input
                  type="email"
                  name="support_email"
                  value={settings.support_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  placeholder="support@assime.net"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boutiques max (Plan Gratuit)</label>
                <input
                  type="number"
                  name="free_plan_shops_limit"
                  value={settings.free_plan_shops_limit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produits max par boutique (Gratuit)</label>
                <input
                  type="number"
                  name="free_plan_products_limit"
                  value={settings.free_plan_products_limit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default Settings
