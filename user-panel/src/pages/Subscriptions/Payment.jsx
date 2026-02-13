import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Upload, ExternalLink, ArrowLeft, Check, Shield, CreditCard, Clock, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const Payment = () => {
  const { planKey } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [proofImage, setProofImage] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1 = payer, 2 = upload preuve
  const [paymentRequestId, setPaymentRequestId] = useState(null)

  useEffect(() => {
    fetchPlan()
  }, [planKey])

  const fetchPlan = async () => {
    try {
      const response = await axios.get('/subscription-payments/plans')
      const selectedPlan = response.data.plans.find(p => p.plan_key === planKey)
      if (!selectedPlan) {
        toast.error('Plan non trouvé')
        navigate('/subscriptions')
        return
      }
      setPlan(selectedPlan)
    } catch (error) {
      toast.error('Erreur lors du chargement du plan')
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
    maxSize: 5 * 1024 * 1024
  })

  // Ouvrir le lien Maketou dans un nouvel onglet
  const handlePayOnMaketou = () => {
    if (!plan?.payment_link) {
      toast.error('Lien de paiement non configuré pour ce plan')
      return
    }
    window.open(plan.payment_link, '_blank')
    setStep(2)
  }

  // Créer la demande de paiement + uploader la preuve
  const handleSubmitProof = async () => {
    if (!proofImage) {
      toast.error('Veuillez téléverser votre capture d\'écran de confirmation')
      return
    }

    try {
      setSubmitting(true)

      // Étape 1 : Créer la demande de paiement
      const response = await axios.post('/subscription-payments/request', {
        planKey: plan.plan_key,
        paymentProvider: 'Maketou',
        paymentPhone: null
      })

      const paymentId = response.data.payment.id
      setPaymentRequestId(paymentId)

      // Étape 2 : Uploader la preuve
      const formData = new FormData()
      formData.append('proofImage', proofImage)

      await axios.post(
        `/api/subscription-payments/${paymentId}/upload-proof`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      toast.success('Demande de paiement envoyée avec succès !')
      navigate(`/subscriptions/payment-status/${paymentId}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi')
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

  if (!plan) return null

  const finalPrice = plan.discount_percent > 0
    ? plan.price * (1 - plan.discount_percent / 100)
    : plan.price

  const features = Array.isArray(plan.features)
    ? plan.features
    : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/subscriptions')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux plans
        </Button>

        {/* Résumé du plan */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">Plan sélectionné</p>
                <h2 className="text-2xl font-bold text-white mt-1">{plan.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {formatPrice(finalPrice, plan.currency)}
                </p>
                {plan.description && (
                  <p className="text-primary-100 text-sm mt-1">{plan.description}</p>
                )}
              </div>
            </div>
          </div>
          <CardBody>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-secondary-700">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Étapes de paiement */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-500'
            }`}>
              {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-primary-700' : 'text-secondary-400'}`}>
              Effectuer le paiement
            </span>
            <div className={`w-16 h-0.5 ${step > 1 ? 'bg-primary-600' : 'bg-secondary-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-500'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary-700' : 'text-secondary-400'}`}>
              Envoyer la preuve
            </span>
          </div>
        </div>

        {/* Étape 1 : Payer via Maketou */}
        <Card className={`mb-6 transition-all ${step === 1 ? 'ring-2 ring-primary-500 shadow-lg' : 'opacity-75'}`}>
          <CardHeader>
            <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
              Étape 1 : Effectuer le paiement
            </h3>
          </CardHeader>
          <CardBody>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900 font-medium mb-1">Paiement sécurisé via Maketou</p>
                  <p className="text-blue-700 text-sm">
                    Vous serez redirigé vers la page de paiement sécurisée Maketou. 
                    Effectuez votre paiement de <strong>{formatPrice(finalPrice, plan.currency)}</strong>, 
                    puis revenez ici pour envoyer la capture d'écran de confirmation.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full py-3 text-lg font-semibold"
              onClick={handlePayOnMaketou}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Effectuer le paiement
            </Button>

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full mt-3 text-sm text-primary-600 hover:text-primary-800 underline text-center"
              >
                J'ai déjà effectué le paiement →
              </button>
            )}
          </CardBody>
        </Card>

        {/* Étape 2 : Upload de la preuve */}
        <Card className={`mb-6 transition-all ${step === 2 ? 'ring-2 ring-primary-500 shadow-lg' : 'opacity-50 pointer-events-none'}`}>
          <CardHeader>
            <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-primary-600" />
              Étape 2 : Envoyer la preuve de paiement
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-secondary-600 text-sm mb-4">
              Téléversez la capture d'écran de confirmation de votre paiement Maketou. 
              Notre équipe vérifiera votre paiement et activera votre abonnement.
            </p>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
                  : proofPreview 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-50/30'
                }
              `}
            >
              <input {...getInputProps()} />
              {proofPreview ? (
                <div>
                  <img
                    src={proofPreview}
                    alt="Aperçu preuve"
                    className="max-w-full max-h-64 mx-auto mb-4 rounded-lg shadow-md"
                  />
                  <p className="text-sm text-green-700 font-medium flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Capture sélectionnée — cliquez pour changer
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                  <p className="text-secondary-700 font-medium mb-2">
                    Glissez votre capture d'écran ici
                  </p>
                  <p className="text-sm text-secondary-500">
                    ou cliquez pour sélectionner (JPEG, PNG, GIF, WEBP — Max 5 Mo)
                  </p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800 text-sm">
                  <strong>Délai de traitement :</strong> Votre paiement sera vérifié 
                  et votre abonnement activé sous 24h maximum.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Boutons d'action */}
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
            onClick={handleSubmitProof}
            isLoading={submitting}
            className="flex-1"
            disabled={!proofImage || step < 2}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Envoyer ma preuve de paiement
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Payment
