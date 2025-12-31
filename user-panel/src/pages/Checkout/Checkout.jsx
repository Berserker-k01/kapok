import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { ShoppingBag, Truck, CheckCircle, ArrowLeft } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { trackInitiateCheckout, trackPurchase, trackAddPaymentInfo, isPixelReady } from '../../utils/facebookPixel'

const checkoutSchema = z.object({
    firstName: z.string().min(2, 'Le prénom est requis'),
    lastName: z.string().min(2, 'Le nom est requis'),
    phone: z.string().min(8, 'Numéro de téléphone invalide'),
    address: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
})

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart()
    const navigate = useNavigate()
    const [isSuccess, setIsSuccess] = useState(false)
    const [facebookPixelId, setFacebookPixelId] = useState(null)

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
        resolver: zodResolver(checkoutSchema)
    })

    // Récupérer le pixel ID depuis localStorage (stocké lors de la visite de la boutique)
    useEffect(() => {
        const pixelId = localStorage.getItem('lesigne_facebook_pixel_id')
        if (pixelId) {
            setFacebookPixelId(pixelId)
        }
    }, [])

    // Tracker InitiateCheckout au chargement de la page
    useEffect(() => {
        if (cartItems.length > 0 && isPixelReady()) {
            const currency = cartItems[0]?.currency || 'XOF'
            trackInitiateCheckout(cartItems, cartTotal, currency)
        }
    }, []) // Une seule fois au montage

    const onSubmit = async (data) => {
        if (cartItems.length === 0) return

        try {
            // Tracker AddPaymentInfo avant la soumission
            if (isPixelReady()) {
                const currency = cartItems[0]?.currency || 'XOF'
                trackAddPaymentInfo(cartTotal, currency)
            }

            // On suppose que tous les items viennent du même shop pour l'instant
            // ou que le backend gère le multi-shop (ce qui n'est pas encore le cas dans notre contrôleur simplifié)
            // On prend le shopId du premier item
            const shopId = cartItems[0].shop_id

            const payload = {
                ...data,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                shopId
            }

            const response = await axios.post('/api/orders/public', payload)
            const orderId = response.data?.data?.order?.id || response.data?.order?.id

            // Tracker Purchase après succès
            if (isPixelReady()) {
                const currency = cartItems[0]?.currency || 'XOF'
                trackPurchase({
                    orderId: orderId || `order_${Date.now()}`,
                    value: cartTotal,
                    currency: currency,
                    items: cartItems.map(item => ({
                        id: item.id,
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                    }))
                })
            }

            setIsSuccess(true)
            clearCart()
            toast.success('Commande enregistrée avec succès !')
        } catch (error) {
            console.error('Erreur commande:', error)
            toast.error("Une erreur est survenue lors de la commande.")
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre commande !</h2>
                    <p className="text-gray-600 mb-6">
                        Nous vous appellerons bientôt au <strong>{watch('phone')}</strong> pour confirmer la livraison.
                    </p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        Retour à la boutique
                    </Button>
                </Card>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        Retour à la boutique
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Récapitulatif Panier */}
                    <div className="space-y-6 order-2 md:order-1">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Votre Panier ({cartItems.length} articles)
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover object-center" />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <p className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} {item.currency || '€'}</p>
                                                </div>
                                                <p className="text-gray-500 text-sm mt-1">Qté: {item.quantity} x {item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <p>Total</p>
                                        <p>{cartTotal.toFixed(2)} €</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-blue-50 border-blue-100">
                            <CardBody className="flex items-start gap-3">
                                <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900">Paiement à la livraison</h4>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Aucun paiement en ligne requis. Payez à la réception.
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Formulaire */}
                    <div className="order-1 md:order-2">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Informations de Livraison</h2>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Prénom"
                                            {...register('firstName')}
                                            error={errors.firstName?.message}
                                            placeholder="Jean"
                                        />
                                        <Input
                                            label="Nom"
                                            {...register('lastName')}
                                            error={errors.lastName?.message}
                                            placeholder="Dupont"
                                        />
                                    </div>

                                    <Input
                                        label="Téléphone"
                                        {...register('phone')}
                                        error={errors.phone?.message}
                                        placeholder="06 12 34 56 78"
                                        type="tel"
                                    />

                                    <Input
                                        label="Adresse complète"
                                        {...register('address')}
                                        error={errors.address?.message}
                                        placeholder="123 Rue de la Paix"
                                    />

                                    <Input
                                        label="Ville"
                                        {...register('city')}
                                        error={errors.city?.message}
                                        placeholder="Paris"
                                    />

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            isLoading={isSubmitting}
                                            className="w-full text-lg py-6"
                                        >
                                            Confirmer la commande - {cartTotal.toFixed(2)} €
                                        </Button>
                                        <p className="text-center text-xs text-gray-500 mt-2">
                                            En commandant, vous acceptez nos conditions générales de vente.
                                        </p>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
