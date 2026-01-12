import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Upload, Phone, CreditCard, ArrowLeft } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const Payment = () => {
  const { planKey } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [paymentNumbers, setPaymentNumbers] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [proofImage, setProofImage] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentRequestId, setPaymentRequestId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [planKey])

  const fetchData = async () => {
    try {
      const [planResponse, paymentNumbersResponse] = await Promise.all([
        axios.get('/subscription-payments/plans'),
        axios.get('/subscription-payments/payment-numbers')
      ])

      const selectedPlan = planResponse.data.plans.find(p => p.plan_key === planKey)
      if (!selectedPlan) {
        toast.error('Plan non trouvé')
        navigate('/subscriptions')
        return
      }

      setPlan(selectedPlan)
      setPaymentNumbers(paymentNumbersResponse.data.paymentNumbers)

      if (paymentNumbersResponse.data.paymentNumbers.length > 0) {
        setSelectedProvider(paymentNumbersResponse.data.paymentNumbers[0].id)
        setPaymentPhone(paymentNumbersResponse.data.paymentNumbers[0].phone_number)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setProofImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setProofPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleCreatePaymentRequest = async () => {
    if (!selectedProvider || !paymentPhone) {
      toast.error('Veuillez sélectionner un moyen de paiement')
      return
    }

    try {
      setSubmitting(true)
      const selectedPaymentNumber = paymentNumbers.find(p => p.id === selectedProvider)

      const response = await axios.post('/subscription-payments/request', {
        planKey: plan.plan_key,
        paymentProvider: selectedPaymentNumber.provider_name,
        paymentPhone: paymentPhone
      })

      setPaymentRequestId(response.data.payment.id)
      toast.success('Demande de paiement créée')

      // Si une image est déjà sélectionnée, l'uploader
      if (proofImage) {
        await handleUploadProof(response.data.payment.id)
      } else {
        toast.info('N\'oubliez pas de téléverser votre preuve de paiement')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création de la demande')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUploadProof = async (paymentId = paymentRequestId) => {
    if (!proofImage || !paymentId) {
      toast.error('Veuillez sélectionner une image de preuve de paiement')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('proofImage', proofImage)

      await axios.post(
        `/api/subscription-payments/${paymentId}/upload-proof`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      toast.success('Preuve de paiement téléversée avec succès')
      navigate(`/subscriptions/payment-status/${paymentId}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du téléversement')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price, currency = 'XOF') => {
    if (price === 0) return 'Gratuit'
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(price)
    return `${formattedPrice} ${currency}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  const finalPrice = plan.discount_percent > 0
    ? plan.price * (1 - plan.discount_percent / 100)
    : plan.price

  const selectedPaymentNumber = paymentNumbers.find(p => p.id === selectedProvider)

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/subscriptions')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-2xl font-bold text-secondary-900">
              Paiement - {plan.name}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary-600">Montant à payer:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(finalPrice, plan.currency)}
                </span>
              </div>
              {plan.discount_percent > 0 && (
                <div className="text-sm text-secondary-500 text-right">
                  <span className="line-through">{formatPrice(plan.price, plan.currency)}</span>
                  <span className="ml-2 text-green-600">-{plan.discount_percent}%</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Informations de paiement
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sélectionnez un moyen de paiement
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value)
                    const selected = paymentNumbers.find(p => p.id === e.target.value)
                    if (selected) {
                      setPaymentPhone(selected.phone_number)
                    }
                  }}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {paymentNumbers.map((paymentNumber) => (
                    <option key={paymentNumber.id} value={paymentNumber.id}>
                      {paymentNumber.provider_name} - {paymentNumber.phone_number}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPaymentNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    {selectedPaymentNumber.provider_name}
                  </p>
                  <p className="text-lg font-bold text-blue-700 mb-2">
                    {selectedPaymentNumber.phone_number}
                  </p>
                  {selectedPaymentNumber.instructions && (
                    <p className="text-sm text-blue-700">
                      {selectedPaymentNumber.instructions}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Numéro de téléphone utilisé pour le paiement
                </label>
                <Input
                  type="text"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="Ex: +225 07 XX XX XX XX"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Preuve de paiement
            </h3>
          </CardHeader>
          <CardBody>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400'}
              `}
            >
              <input {...getInputProps()} />
              {proofPreview ? (
                <div>
                  <img
                    src={proofPreview}
                    alt="Aperçu"
                    className="max-w-full max-h-64 mx-auto mb-4 rounded-lg"
                  />
                  <p className="text-sm text-secondary-600">
                    Cliquez ou glissez une nouvelle image pour remplacer
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                  <p className="text-secondary-600 mb-2">
                    Glissez votre capture d'écran de confirmation ici
                  </p>
                  <p className="text-sm text-secondary-500">
                    ou cliquez pour sélectionner (JPEG, PNG, GIF, WEBP - Max 5MB)
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/subscriptions')}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={paymentRequestId ? () => handleUploadProof() : handleCreatePaymentRequest}
            isLoading={submitting}
            className="flex-1"
            disabled={!proofImage && !paymentRequestId}
          >
            {paymentRequestId ? 'Téléverser la preuve' : 'Créer la demande de paiement'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Payment

