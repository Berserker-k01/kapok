import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Check, Infinity, Store, Package, Headphones } from 'lucide-react'

const PlanSelection = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/subscription-payments/plans')
      setPlans(response.data.plans)
    } catch (error) {
      toast.error('Erreur lors du chargement des plans')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price, currency = 'XOF') => {
    if (price === 0) return 'Gratuit'
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(price)
    return `${formattedPrice} ${currency}`
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
    <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-secondary-600">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const features = Array.isArray(plan.features)
              ? plan.features
              : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])

            const finalPrice = plan.discount_percent > 0
              ? plan.price * (1 - plan.discount_percent / 100)
              : plan.price

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.plan_key === 'pro' ? 'ring-2 ring-primary-500 scale-105' : ''}`}
              >
                {plan.discount_percent > 0 && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-sm font-bold">
                    -{plan.discount_percent}%
                  </div>
                )}

                <CardHeader>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {formatPrice(finalPrice, plan.currency)}
                    </div>
                    {plan.discount_percent > 0 && (
                      <div className="text-sm text-secondary-500 line-through">
                        {formatPrice(plan.price, plan.currency)}
                      </div>
                    )}
                    {plan.description && (
                      <p className="text-sm text-secondary-600 mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardBody>
                  <ul className="space-y-3 mb-6">
                    {plan.max_shops !== null ? (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary-700">
                          {plan.max_shops === null ? (
                            <>
                              <Infinity className="inline h-4 w-4" /> Boutiques illimitées
                            </>
                          ) : (
                            `${plan.max_shops} ${plan.max_shops === 1 ? 'boutique' : 'boutiques'}`
                          )}
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary-700">
                          <Infinity className="inline h-4 w-4" /> Boutiques illimitées
                        </span>
                      </li>
                    )}

                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.plan_key === 'pro' ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.plan_key)}
                  >
                    {plan.price === 0 ? 'Utiliser gratuitement' : 'Choisir ce plan'}
                  </Button>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlanSelection

