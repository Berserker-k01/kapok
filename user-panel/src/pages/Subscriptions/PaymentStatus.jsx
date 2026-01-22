import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Clock, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const PaymentStatus = () => {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayment()
    // Polling toutes les 10 secondes pour vérifier le statut
    const interval = setInterval(fetchPayment, 10000)
    return () => clearInterval(interval)
  }, [paymentId])

  const fetchPayment = async () => {
    try {
      const response = await axios.get(`/subscription-payments/status/${paymentId}`)
      const newStatus = response.data.payment
      setPayment(newStatus)

      // Si approuvé, on force le rafraîchissement du profil utilisateur
      if (newStatus.status === 'approved') {
        // Import dynamique ou utilisation du store global si possible
        // Mais ici on est dans un composant, on peut importer le hook ou le store
        const { useAuthStore } = await import('../../store/authStore')
        useAuthStore.getState().checkAuth()
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du statut')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">En attente de validation</Badge>
      case 'approved':
        return <Badge variant="success">Approuvé</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejeté</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Annulé</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-16 w-16 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Clock className="h-16 w-16 text-secondary-400" />
    }
  }

  const formatPrice = (amount, currency = 'XOF') => {
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(amount)
    return `${formattedPrice} ${currency}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-secondary-600">Paiement non trouvé</p>
          <Button onClick={() => navigate('/subscriptions')} className="mt-4">
            Retour aux abonnements
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/subscriptions')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card>
          <CardBody className="text-center">
            <div className="mb-6">
              {getStatusIcon(payment.status)}
            </div>

            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              {payment.status === 'pending' && 'Paiement en traitement'}
              {payment.status === 'approved' && 'Paiement approuvé !'}
              {payment.status === 'rejected' && 'Paiement rejeté'}
              {payment.status === 'cancelled' && 'Paiement annulé'}
            </h1>

            <div className="mb-6">
              {getStatusBadge(payment.status)}
            </div>

            {payment.status === 'pending' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-900">
                  Votre paiement est en cours de vérification par notre équipe.
                  Vous recevrez une notification une fois la validation effectuée.
                </p>
              </div>
            )}

            {payment.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-900 font-medium">
                  Félicitations ! Votre abonnement {payment.plan_name} est maintenant actif.
                </p>
              </div>
            )}

            {payment.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-900 font-medium mb-2">
                  Votre paiement a été rejeté.
                </p>
                {payment.admin_notes && (
                  <p className="text-red-800 text-sm">
                    Raison: {payment.admin_notes}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white border border-secondary-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-secondary-900 mb-4">Détails du paiement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Plan:</span>
                  <span className="font-medium">{payment.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Montant:</span>
                  <span className="font-medium">{formatPrice(payment.amount, payment.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Moyen de paiement:</span>
                  <span className="font-medium">{payment.payment_provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Date de demande:</span>
                  <span className="font-medium">
                    {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {payment.reviewed_at && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Date de traitement:</span>
                    <span className="font-medium">
                      {new Date(payment.reviewed_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {payment.proof_image_url && (
              <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-2">Preuve de paiement</h3>
                <img
                  src={payment.proof_image_url}
                  alt="Preuve de paiement"
                  className="max-w-full rounded-lg border border-secondary-200"
                />
              </div>
            )}

            <div className="flex gap-4">
              {payment.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={fetchPayment}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Retour au dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default PaymentStatus

