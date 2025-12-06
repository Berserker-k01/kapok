const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres Administrateur</h1>
        <p className="text-gray-600">Configuration de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Générale</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la plateforme</label>
              <input type="text" className="input-field" defaultValue="Lesigne" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email support</label>
              <input type="email" className="input-field" defaultValue="support@lesigne.com" />
            </div>
            <button className="btn-primary">Sauvegarder</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites Plateforme</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boutiques gratuites par utilisateur</label>
              <input type="number" className="input-field" defaultValue="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produits max par boutique gratuite</label>
              <input type="number" className="input-field" defaultValue="100" />
            </div>
            <button className="btn-primary">Mettre à jour</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
