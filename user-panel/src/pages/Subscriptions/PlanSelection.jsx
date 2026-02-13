import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Check, Crown, Zap, Rocket, ArrowRight } from 'lucide-react'
import SubscriptionTimer from '../../components/SubscriptionTimer'

const planIcons = {
  basic: Zap,
  premium: Crown,
  gold: Rocket,
}

const planColors = {
  basic: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    ring: 'ring-blue-500',
  },
  premium: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    ring: 'ring-purple-500',
  },
  gold: {
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    ring: 'ring-amber-500',
  },
}

const PlanSelection = () => {
  const [plans, setPlans] = useState([])
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        axios.get('/plans'),
        axios.get('/subscription-payments/active').catch(() => ({ data: { subscription: null } }))
      ])

      setPlans(plansRes.data.plans)
      setActiveSubscription(subRes.data.subscription)
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price, currency = 'XOF') => {
    if (price === 0) return 'Gratuit'
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(price)
    return formattedPrice
  }

  const handleSelectPlan = (planKey) => {
    navigate(`/subscriptions/payment/${planKey}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {activeSubscription && (
          <div className="mb-8 max-w-2xl mx-auto">
            <SubscriptionTimer endDate={activeSubscription.current_period_end} />
          </div>
        )}

        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary-100 text-primary-800 px-4 py-1.5 text-sm font-medium">
            Offres d'abonnement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            {activeSubscription ? 'Gérer votre abonnement' : 'Choisissez votre plan'}
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            {activeSubscription
              ? `Votre plan actuel : ${activeSubscription.plan_name || 'Inconnu'}`
              : 'Lancez votre business e-commerce avec Assimε. Choisissez le plan qui vous convient.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const features = Array.isArray(plan.features)
              ? plan.features
              : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])

            const finalPrice = plan.discount_percent > 0
              ? plan.price * (1 - plan.discount_percent / 100)
              : plan.price

            const colors = planColors[plan.plan_key] || planColors.basic
            const IconComponent = planIcons[plan.plan_key] || Zap
            const isPopular = plan.plan_key === 'premium'
            const isCurrentPlan = activeSubscription?.plan_name === plan.name

            return (
              <div key={plan.id} className="relative">
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <Card className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPopular ? `ring-2 ${colors.ring} shadow-lg` : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>

                  {/* Header du plan */}
                  <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-6 rounded-t-xl`}>
                    <div className="flex items-center mb-3">
                      <div className="bg-white/20 rounded-lg p-2 mr-3">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-white">
                        {formatPrice(finalPrice, plan.currency)}
                      </span>
                      <span className="text-white/70 ml-2 text-sm">
                        {plan.currency}
                      </span>
                    </div>
                    {plan.discount_percent > 0 && (
                      <div className="mt-1">
                        <span className="text-white/60 line-through text-sm">
                          {formatPrice(plan.price)} {plan.currency}
                        </span>
                        <span className="ml-2 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{plan.discount_percent}%
                        </span>
                      </div>
                    )}
                    {plan.description && (
                      <p className="text-white/80 text-sm mt-2">{plan.description}</p>
                    )}
                  </div>

                  {/* Features */}
                  <CardBody className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.max_shops !== null && (
                        <li className="flex items-start">
                          <div className={`rounded-full p-0.5 mr-3 mt-0.5 flex-shrink-0 ${colors.bg}`}>
                            <Check className={`h-3.5 w-3.5 ${colors.text}`} />
                          </div>
                          <span className="text-secondary-700 text-sm font-medium">
                            {plan.max_shops} {plan.max_shops === 1 ? 'boutique' : 'boutiques'}
                          </span>
                        </li>
                      )}
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className={`rounded-full p-0.5 mr-3 mt-0.5 flex-shrink-0 ${colors.bg}`}>
                            <Check className={`h-3.5 w-3.5 ${colors.text}`} />
                          </div>
                          <span className="text-secondary-700 text-sm">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start">
                        <div className={`rounded-full p-0.5 mr-3 mt-0.5 flex-shrink-0 ${colors.bg}`}>
                          <Check className={`h-3.5 w-3.5 ${colors.text}`} />
                        </div>
                        <span className="text-secondary-700 text-sm font-semibold">
                          Durée : {plan.duration_months || 1} mois
                        </span>
                      </li>
                    </ul>

                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      className={`w-full py-3 font-semibold ${isPopular ? '' : 'hover:bg-primary-50'}`}
                      onClick={() => handleSelectPlan(plan.plan_key)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Plan Actuel
                        </>
                      ) : (
                        <>
                          Choisir {plan.name}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardBody>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Section de confiance */}
        <div className="mt-16 text-center">
          <p className="text-secondary-500 text-sm mb-4">Paiement sécurisé via</p>
          <div className="flex items-center justify-center gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-100 px-6 py-3">
              <span className="font-bold text-secondary-800">Maketou</span>
              <span className="text-secondary-400 mx-2">•</span>
              <span className="text-secondary-500 text-sm">Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanSelection
