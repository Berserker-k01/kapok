import { useState } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'
import { FiUser, FiLock, FiSave } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  // États pour le profil
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  // États pour le mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.put('/users/profile', profileData)
      // Handle both response formats: response.data.user or response.data.data.user
      const updatedUser = response.data.data?.user || response.data.user
      if (updatedUser) {
        updateUser(updatedUser)
        toast.success('Profil mis à jour avec succès')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      await axios.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Mot de passe modifié avec succès')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.error || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation / Tabs */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'profile'
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-secondary-600 hover:bg-secondary-50'
              }`}
          >
            <FiUser className="mr-3" />
            Mon Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'security'
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-secondary-600 hover:bg-secondary-50'
              }`}
          >
            <FiLock className="mr-3" />
            Sécurité
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <Card>
            <CardBody>
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="border-b border-secondary-100 pb-4 mb-4">
                    <h2 className="text-lg font-medium text-secondary-900">Informations personnelles</h2>
                    <p className="text-sm text-muted-foreground">Mettez à jour vos coordonnées</p>
                  </div>

                  <Input
                    label="Nom complet"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Adresse email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                  />

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" isLoading={loading}>
                      <FiSave className="mr-2" />
                      Enregistrer les modifications
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="border-b border-secondary-100 pb-4 mb-4">
                    <h2 className="text-lg font-medium text-secondary-900">Mot de passe</h2>
                    <p className="text-sm text-muted-foreground">Modifiez votre mot de passe pour sécuriser votre compte</p>
                  </div>

                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nouveau mot de passe"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <Input
                      label="Confirmer le nouveau mot de passe"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" isLoading={loading}>
                      <FiSave className="mr-2" />
                      Modifier le mot de passe
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings
