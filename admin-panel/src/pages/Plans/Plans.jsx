import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'

const Plans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    plan_key: '',
    name: '',
    description: '',
    price: '',
    currency: 'XOF',
    max_shops: '',
    features: '',
    discount_percent: '0',
    is_active: true,
    display_order: '0'
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/admin/plans')
      setPlans(response.data.plans)
    } catch (error) {
      toast.error('Erreur lors du chargement des plans')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      const features = Array.isArray(plan.features) 
        ? plan.features.join('\n')
        : (typeof plan.features === 'string' ? JSON.parse(plan.features).join('\n') : '')
      
      setFormData({
        plan_key: plan.plan_key,
        name: plan.name,
        description: plan.description || '',
        price: plan.price.toString(),
        currency: plan.currency,
        max_shops: plan.max_shops ? plan.max_shops.toString() : '',
        features: features,
        discount_percent: plan.discount_percent ? plan.discount_percent.toString() : '0',
        is_active: plan.is_active,
        display_order: plan.display_order ? plan.display_order.toString() : '0'
      })
    } else {
      setEditingPlan(null)
      setFormData({
        plan_key: '',
        name: '',
        description: '',
        price: '',
        currency: 'XOF',
        max_shops: '',
        features: '',
        discount_percent: '0',
        is_active: true,
        display_order: '0'
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        max_shops: formData.max_shops ? parseInt(formData.max_shops) : null,
        features: featuresArray,
        discount_percent: parseFloat(formData.discount_percent),
        display_order: parseInt(formData.display_order)
      }

      if (editingPlan) {
        await axios.put(`/api/admin/plans/${editingPlan.id}`, payload)
        toast.success('Plan mis à jour avec succès')
      } else {
        await axios.post('/api/admin/plans', payload)
        toast.success('Plan créé avec succès')
      }

      setShowModal(false)
      fetchPlans()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
      console.error(error)
    }
  }

  const handleDelete = async (planId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      return
    }

    try {
      await axios.delete(`/api/admin/plans/${planId}`)
      toast.success('Plan supprimé avec succès')
      fetchPlans()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
      console.error(error)
    }
  }

  const formatPrice = (price, currency = 'XOF') => {
    if (price === 0) return 'Gratuit'
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(price)
    return `${formattedPrice} ${currency}`
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Gestion des plans
          </h1>
          <p className="text-secondary-600">
            Configurez les plans d'abonnement disponibles
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const features = Array.isArray(plan.features) 
            ? plan.features 
            : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
          
          const finalPrice = plan.discount_percent > 0
            ? plan.price * (1 - plan.discount_percent / 100)
            : plan.price

          return (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900">
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-bold text-primary-600 mt-2">
                      {formatPrice(finalPrice, plan.currency)}
                    </p>
                    {plan.discount_percent > 0 && (
                      <Badge variant="success" className="mt-2">
                        -{plan.discount_percent}%
                      </Badge>
                    )}
                  </div>
                  <Badge variant={plan.is_active ? 'success' : 'secondary'}>
                    {plan.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                {plan.description && (
                  <p className="text-sm text-secondary-600 mb-4">
                    {plan.description}
                  </p>
                )}
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-secondary-700 mb-2">Fonctionnalités:</p>
                  <ul className="space-y-1">
                    {plan.max_shops !== null ? (
                      <li className="text-sm text-secondary-600">
                        • {plan.max_shops} {plan.max_shops === 1 ? 'boutique' : 'boutiques'}
                      </li>
                    ) : (
                      <li className="text-sm text-secondary-600">• Boutiques illimitées</li>
                    )}
                    {features.map((feature, index) => (
                      <li key={index} className="text-sm text-secondary-600">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(plan)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold text-secondary-900">
                {editingPlan ? 'Modifier le plan' : 'Nouveau plan'}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Clé du plan *
                    </label>
                    <Input
                      value={formData.plan_key}
                      onChange={(e) => setFormData({ ...formData, plan_key: e.target.value })}
                      required
                      disabled={!!editingPlan}
                      placeholder="ex: basic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Nom *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="ex: Plan Basic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Prix *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Devise
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="XOF">XOF</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Réduction (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Max boutiques (laisser vide pour illimité)
                    </label>
                    <Input
                      type="number"
                      value={formData.max_shops}
                      onChange={(e) => setFormData({ ...formData, max_shops: e.target.value })}
                      placeholder="ex: 5"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Fonctionnalités (une par ligne)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="5"
                    placeholder="Support prioritaire&#10;Analytics avancées&#10;..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-secondary-700">
                    Plan actif
                  </label>
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
                    {editingPlan ? 'Mettre à jour' : 'Créer'}
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

export default Plans

