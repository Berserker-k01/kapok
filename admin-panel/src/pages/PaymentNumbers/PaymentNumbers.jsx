import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { Plus, Edit2, Trash2, Check, X, Phone } from 'lucide-react'

const PaymentNumbers = () => {
  const [paymentNumbers, setPaymentNumbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPaymentNumber, setEditingPaymentNumber] = useState(null)
  const [formData, setFormData] = useState({
    provider_name: '',
    phone_number: '',
    provider_type: 'mobile_money',
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
      toast.error('Erreur lors du chargement des numéros')
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
        provider_type: paymentNumber.provider_type,
        instructions: paymentNumber.instructions || '',
        is_active: paymentNumber.is_active,
        display_order: paymentNumber.display_order ? paymentNumber.display_order.toString() : '0'
      })
    } else {
      setEditingPaymentNumber(null)
      setFormData({
        provider_name: '',
        phone_number: '',
        provider_type: 'mobile_money',
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
        toast.success('Numéro mis à jour avec succès')
      } else {
        await axios.post('/admin/payment-numbers', payload)
        toast.success('Numéro créé avec succès')
      }

      setShowModal(false)
      fetchPaymentNumbers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce numéro ?')) {
      return
    }

    try {
      await axios.delete(`/admin/payment-numbers/${id}`)
      toast.success('Numéro supprimé avec succès')
      fetchPaymentNumbers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
      console.error(error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Numéros de paiement
          </h1>
          <p className="text-secondary-600">
            Gérez les numéros de téléphone pour les paiements manuels
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau numéro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentNumbers.map((paymentNumber) => (
          <Card key={paymentNumber.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-secondary-900 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    {paymentNumber.provider_name}
                  </h3>
                  <p className="text-lg font-semibold text-primary-600 mt-2">
                    {paymentNumber.phone_number}
                  </p>
                </div>
                <Badge variant={paymentNumber.is_active ? 'success' : 'secondary'}>
                  {paymentNumber.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="mb-4">
                <Badge variant="info" className="mb-2">
                  {paymentNumber.provider_type === 'mobile_money' ? 'Mobile Money' : paymentNumber.provider_type}
                </Badge>
                {paymentNumber.instructions && (
                  <p className="text-sm text-secondary-600 mt-2">
                    {paymentNumber.instructions}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(paymentNumber)}
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(paymentNumber.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <h2 className="text-2xl font-bold text-secondary-900">
                {editingPaymentNumber ? 'Modifier le numéro' : 'Nouveau numéro'}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nom du fournisseur *
                  </label>
                  <Input
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    required
                    placeholder="ex: Orange Money"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Numéro de téléphone *
                  </label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                    placeholder="ex: +225 07 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.provider_type}
                    onChange={(e) => setFormData({ ...formData, provider_type: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank">Banque</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Instructions pour l'utilisateur..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
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
                    <label htmlFor="is_active" className="ml-2 text-sm text-secondary-700">
                      Actif
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
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

