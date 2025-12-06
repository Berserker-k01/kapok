import { useState } from 'react'
import { FiUser, FiCreditCard, FiBell, FiShield, FiGlobe } from 'react-icons/fi'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profil', icon: FiUser },
    { id: 'billing', name: 'Facturation', icon: FiCreditCard },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'security', name: 'Sécurité', icon: FiShield },
    { id: 'preferences', name: 'Préférences', icon: FiGlobe },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez votre compte et vos préférences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du Profil</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input type="text" className="input-field" defaultValue="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input type="text" className="input-field" defaultValue="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input type="email" className="input-field" defaultValue="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input type="tel" className="input-field" defaultValue="+33 6 12 34 56 78" />
                </div>

                <button type="submit" className="btn-primary">
                  Sauvegarder
                </button>
              </form>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Actuel</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">Plan Gratuit</p>
                    <p className="text-gray-600">2 boutiques • Fonctionnalités de base</p>
                  </div>
                  <button className="btn-primary">
                    Passer au Premium
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de Paiement</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-500">Expire 12/25</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm">
                      Supprimer
                    </button>
                  </div>

                  <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
                    + Ajouter une méthode de paiement
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de Notification</h3>
              <div className="space-y-4">
                {[
                  { name: 'Nouvelles commandes', description: 'Recevoir un email pour chaque nouvelle commande' },
                  { name: 'Mises à jour produits', description: 'Notifications sur les changements de stock' },
                  { name: 'Rapports hebdomadaires', description: 'Résumé des performances chaque semaine' },
                  { name: 'Promotions', description: 'Recevoir des offres et nouveautés Lesigne' },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{notification.name}</p>
                      <p className="text-sm text-gray-500">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le Mot de Passe</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input type="password" className="input-field" />
                  </div>
                  <button type="submit" className="btn-primary">
                    Mettre à jour
                  </button>
                </form>
              </div>

              {/* Two Factor Auth */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentification à Deux Facteurs</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Sécurisez votre compte avec 2FA</p>
                    <p className="text-sm text-gray-500">Actuellement désactivée</p>
                  </div>
                  <button className="btn-secondary">
                    Activer 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences Générales</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue
                  </label>
                  <select className="input-field">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuseau horaire
                  </label>
                  <select className="input-field">
                    <option>Europe/Paris (GMT+1)</option>
                    <option>Europe/London (GMT+0)</option>
                    <option>America/New_York (GMT-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Devise par défaut
                  </label>
                  <select className="input-field">
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="XAF">FCFA (XAF)</option>
                    <option value="GNF">Franc Guinéen (GNF)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary">
                  Sauvegarder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
