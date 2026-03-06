import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { Plus, Edit2, Trash2, Check, X, Link2, ExternalLink, Copy } from 'lucide-react'

const PaymentNumbers = () => {
  const [paymentNumbers, setPaymentNumbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPaymentNumber, setEditingPaymentNumber] = useState(null)
  const [formData, setFormData] = useState({
    provider_name: '',
    phone_number: '',
    provider_type: 'payment_link',
    instructions: '',
    is_active: true,
    display_order: '0'
  })

  useEffect(() => {
    fetchPaymentNumbers()
  }, [])

  const fetchPaymentNumbers = async () => {
    try {
      const response = await axios.get('/admin/payment-numbers')
      setPaymentNumbers(response.data.paymentNumbers)
    } catch (error) {
      toast.error('Erreur lors du chargement')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (paymentNumber = null) => {
    if (paymentNumber) {
      setEditingPaymentNumber(paymentNumber)
      setFormData({
        provider_name: paymentNumber.provider_name,
        phone_number: paymentNumber.phone_number,
        provider_type: paymentNumber.provider_type || 'payment_link',
        instructions: paymentNumber.instructions || '',
        is_active: paymentNumber.is_active,
        display_order: paymentNumber.display_order ? paymentNumber.display_order.toString() : '0'
      })
    } else {
      setEditingPaymentNumber(null)
      setFormData({
        provider_name: '',
        phone_number: '',
        provider_type: 'payment_link',
        instructions: '',
        is_active: true,
        display_order: '0'
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        display_order: parseInt(formData.display_order)
      }

      if (editingPaymentNumber) {
        await axios.put(`/admin/payment-numbers/${editingPaymentNumber.id}`, payload)
        toast.success('Lien de paiement mis à jour')
      } else {
        await axios.post('/admin/payment-numbers', payload)
        toast.success('Lien de paiement créé')
      }

      setShowModal(false)
      fetchPaymentNumbers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lien de paiement ?')) {
      return
    }

    try {
      await axios.delete(`/admin/payment-numbers/${id}`)
      toast.success('Lien supprimé avec succès')
      fetchPaymentNumbers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
      console.error(error)
    }
  }

  const copyLink = (link) => {
    navigator.clipboard.writeText(link)
    toast.success('Lien copié !')
  }

  const getProviderIcon = (type) => {
    if (type === 'payment_link') return '🔗'
    if (type === 'mobile_money') return '📱'
    if (type === 'bank') return '🏦'
    return '💳'
  }

  const getProviderLabel = (type) => {
    if (type === 'payment_link') return 'Lien de paiement'
    if (type === 'mobile_money') return 'Mobile Money'
    if (type === 'bank') return 'Virement bancaire'
    return 'Autre'
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Liens de paiement
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Gérez les liens Maketou et autres moyens de paiement pour les abonnements
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau lien
        </Button>
      </div>

      {paymentNumbers.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Aucun lien de paiement</h3>
              <p className="text-secondary-500 mb-4">Ajoutez vos liens Maketou pour permettre aux utilisateurs de payer</p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un lien
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentNumbers.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProviderIcon(item.provider_type)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
                        {item.provider_name}
                      </h3>
                      <span className="text-xs text-secondary-500">{getProviderLabel(item.provider_type)}</span>
                    </div>
                  </div>
                  <Badge variant={item.is_active ? 'success' : 'secondary'}>
                    {item.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                {/* Affichage du lien */}
                <div className="bg-gray-50 dark:bg-secondary-800 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium truncate flex-1" title={item.phone_number}>
                      {item.phone_number}
                    </p>
                    <button
                      onClick={() => copyLink(item.phone_number)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-secondary-700 rounded-md transition-colors flex-shrink-0"
                      title="Copier le lien"
                    >
                      <Copy className="h-3.5 w-3.5 text-secondary-500" />
                    </button>
                    {item.phone_number.startsWith('http') && (
                      <a
                        href={item.phone_number}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-secondary-700 rounded-md transition-colors flex-shrink-0"
                        title="Ouvrir le lien"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-secondary-500" />
                      </a>
                    )}
                  </div>
                </div>

                {item.instructions && (
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
                    {item.instructions}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(item)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Link2 className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                  {editingPaymentNumber ? 'Modifier le lien' : 'Nouveau lien de paiement'}
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Nom du service *
                  </label>
                  <Input
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    required
                    placeholder="ex: Maketou, Orange Money, Wave..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Lien de paiement *
                  </label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                    placeholder="ex: https://maketou.com/pay/votre-lien"
                  />
                  <p className="text-xs text-secondary-400 mt-1">Collez ici le lien Maketou ou tout autre lien de paiement</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Type de paiement
                  </label>
                  <select
                    value={formData.provider_type}
                    onChange={(e) => setFormData({ ...formData, provider_type: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  >
                    <option value="payment_link">🔗 Lien de paiement (Maketou, etc.)</option>
                    <option value="mobile_money">📱 Mobile Money</option>
                    <option value="bank">🏦 Virement bancaire</option>
                    <option value="other">💳 Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Instructions pour le client
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    rows="3"
                    placeholder="ex: Cliquez sur le lien, entrez le montant de votre plan, puis envoyez la capture d'écran..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Ordre d'affichage
                    </label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                      Actif
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                    type="button"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {editingPaymentNumber ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PaymentNumbers
