import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Check, X, Eye, Clock } from 'lucide-react'
import { resolveImageUrl } from '../../utils/imageUrl'

const PaymentRequests = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/subscription-payments/admin/pending')
      setPayments(response.data.payments)
    } catch (error) {
      toast.error('Erreur lors du chargement des paiements')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver ce paiement ?')) {
      return
    }

    try {
      setProcessing(true)
      await axios.post(`/subscription-payments/admin/${paymentId}/approve`, {
        adminNotes: adminNotes || null
      })
      toast.success('Paiement approuvé avec succès')
      setSelectedPayment(null)
      setAdminNotes('')
      fetchPayments()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'approbation')
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (paymentId) => {
    if (!adminNotes.trim()) {
      toast.error('Veuillez indiquer la raison du rejet')
      return
    }

    if (!window.confirm('Êtes-vous sûr de vouloir rejeter ce paiement ?')) {
      return
    }

    try {
      setProcessing(true)
      await axios.post(`/subscription-payments/admin/${paymentId}/reject`, {
        adminNotes: adminNotes
      })
      toast.success('Paiement rejeté')
      setSelectedPayment(null)
      setAdminNotes('')
      fetchPayments()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du rejet')
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (amount, currency = 'XOF') => {
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(amount)
    return `${formattedPrice} ${currency}`
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Demandes de paiement
        </h1>
        <p className="text-secondary-600">
          {payments.length} paiement(s) en attente de validation
        </p>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Clock className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">Aucun paiement en attente</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardBody>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {payment.user_name}
                    </h3>
                    <p className="text-sm text-secondary-600">{payment.user_email}</p>
                  </div>
                  <Badge variant="warning">En attente</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Plan:</span>
                    <span className="font-medium">{payment.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Montant:</span>
                    <span className="font-bold text-primary-600">
                      {formatPrice(payment.amount, payment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Moyen de paiement:</span>
                    <span className="font-medium">{payment.payment_provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Téléphone:</span>
                    <span className="font-medium">{payment.payment_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Date:</span>
                    <span className="text-sm">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {payment.proof_image_url && (
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir la preuve de paiement
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(payment.id)}
                    isLoading={processing}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(payment)
                      setAdminNotes('')
                    }}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal pour voir la preuve et rejeter */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardBody>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-secondary-900">
                  Détails du paiement
                </h2>
                <button
                  onClick={() => {
                    setSelectedPayment(null)
                    setAdminNotes('')
                  }}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Utilisateur</p>
                  <p className="font-medium">{selectedPayment.user_name}</p>
                  <p className="text-sm text-secondary-600">{selectedPayment.user_email}</p>
                </div>

                <div>
                  <p className="text-sm text-secondary-600 mb-1">Plan</p>
                  <p className="font-medium">{selectedPayment.plan_name}</p>
                </div>

                <div>
                  <p className="text-sm text-secondary-600 mb-1">Montant</p>
                  <p className="font-bold text-primary-600">
                    {formatPrice(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>

                {selectedPayment.proof_image_url && (
                  <div>
                    <p className="text-sm text-secondary-600 mb-2">Preuve de paiement</p>
                    <img
                      src={resolveImageUrl(selectedPayment.proof_image_url)}
                      alt="Preuve de paiement"
                      className="max-w-full rounded-lg border border-secondary-200"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Notes (obligatoire pour rejeter)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Ajoutez des notes sur ce paiement..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(null)
                    setAdminNotes('')
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedPayment.id)}
                  isLoading={processing}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approuver
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleReject(selectedPayment.id)}
                  isLoading={processing}
                  disabled={!adminNotes.trim()}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PaymentRequests

