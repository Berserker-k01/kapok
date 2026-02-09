import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import {
    ShoppingBag,
    Truck,
    CheckCircle,
    ArrowLeft,
    Lock,
    MapPin,
    Phone,
    User,
    CreditCard,
    Package
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { trackInitiateCheckout, trackPurchase, trackAddPaymentInfo, isPixelReady } from '../../utils/facebookPixel'
import { formatCurrency } from '../../utils/currency'

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
            const errorMessage = error.response?.data?.error || error.response?.data?.details || "Une erreur est survenue lors de la commande.";
            toast.error(errorMessage)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full text-center p-8 shadow-2xl border-0">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Commande confirmée !</h2>
                    <p className="text-gray-600 mb-2">
                        Merci pour votre confiance. Votre commande a été enregistrée avec succès.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                        <p className="text-sm text-blue-900 font-medium">
                            📞 Nous vous appellerons au <strong>{watch('phone')}</strong> pour confirmer la livraison.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Button onClick={() => navigate(-1)} className="w-full">
                            Retour à la boutique
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
                    <p className="text-gray-600 mb-6">Ajoutez des articles pour continuer vos achats.</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        Retour à la boutique
                    </Button>
                </div>
            </div>
        )
    }

    const currency = cartItems[0]?.currency || 'XOF'
    const deliveryFee = 0 // Livraison gratuite
    const finalTotal = cartTotal + deliveryFee

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-black mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Retour à la boutique
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Finaliser votre commande</h1>
                    <p className="text-gray-600 mt-2">Remplissez vos informations pour recevoir votre commande</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <span className="text-sm font-medium text-gray-900">Panier</span>
                        </div>
                        <div className="h-0.5 w-12 bg-primary-600"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <span className="text-sm font-medium text-gray-900">Livraison</span>
                        </div>
                        <div className="h-0.5 w-12 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <span className="text-sm font-medium text-gray-500">Confirmation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations de livraison */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Informations de livraison</h2>
                                        <p className="text-sm text-gray-600">Où souhaitez-vous recevoir votre commande ?</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <User className="absolute left-3 top-10 w-4 h-4 text-gray-400" />
                                            <Input
                                                label="Prénom *"
                                                {...register('firstName')}
                                                error={errors.firstName?.message}
                                                placeholder="Jean"
                                                className="pl-10"
                                            />
                                        </div>
                                        <div className="relative">
                                            <User className="absolute left-3 top-10 w-4 h-4 text-gray-400" />
                                            <Input
                                                label="Nom *"
                                                {...register('lastName')}
                                                error={errors.lastName?.message}
                                                placeholder="Dupont"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Phone className="absolute left-3 top-10 w-4 h-4 text-gray-400" />
                                        <Input
                                            label="Téléphone *"
                                            {...register('phone')}
                                            error={errors.phone?.message}
                                            placeholder="+221 77 123 45 67"
                                            type="tel"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-10 w-4 h-4 text-gray-400" />
                                        <Input
                                            label="Adresse complète *"
                                            {...register('address')}
                                            error={errors.address?.message}
                                            placeholder="123 Rue de la République, Appartement 4B"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-10 w-4 h-4 text-gray-400" />
                                        <Input
                                            label="Ville *"
                                            {...register('city')}
                                            error={errors.city?.message}
                                            placeholder="Dakar"
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Submit Button - Mobile Only */}
                                    <div className="lg:hidden pt-4">
                                        <Button
                                            type="submit"
                                            isLoading={isSubmitting}
                                            className="w-full text-lg py-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
                                        >
                                            <Lock className="w-5 h-5 mr-2" />
                                            Confirmer la commande - {formatCurrency(finalTotal, currency)}
                                        </Button>
                                        <p className="text-center text-xs text-gray-500 mt-3">
                                            🔒 Paiement sécurisé • En commandant, vous acceptez nos CGV
                                        </p>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>

                        {/* Mode de paiement */}
                        <Card className="shadow-lg border-2 border-green-200 bg-green-50">
                            <CardBody className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">Paiement à la livraison</h4>
                                    <p className="text-gray-700 text-sm">
                                        ✓ Aucun paiement en ligne requis<br />
                                        ✓ Payez en espèces lors de la réception<br />
                                        ✓ Vérifiez votre commande avant de payer
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Récapitulatif - Right Side */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5" />
                                        Récapitulatif ({cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'})
                                    </h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    {/* Items List */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-custom">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover object-center" />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                                                    <p className="text-gray-500 text-xs mt-0.5">Qté: {item.quantity}</p>
                                                    <p className="font-semibold text-primary-600 text-sm mt-1">
                                                        {formatCurrency(item.price * item.quantity, currency)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pricing Summary */}
                                    <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Sous-total</span>
                                            <span className="font-medium">{formatCurrency(cartTotal, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Livraison</span>
                                            <span className="font-medium text-green-600">Gratuite</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
                                            <span>Total</span>
                                            <span className="text-primary-600">{formatCurrency(finalTotal, currency)}</span>
                                        </div>
                                    </div>

                                    {/* Desktop Submit Button */}
                                    <div className="hidden lg:block pt-4">
                                        <Button
                                            type="submit"
                                            onClick={handleSubmit(onSubmit)}
                                            isLoading={isSubmitting}
                                            className="w-full text-lg py-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
                                        >
                                            <Lock className="w-5 h-5 mr-2" />
                                            Confirmer - {formatCurrency(finalTotal, currency)}
                                        </Button>
                                        <p className="text-center text-xs text-gray-500 mt-3">
                                            🔒 Paiement sécurisé
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Trust Badges */}
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                                            <Truck className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">Livraison rapide</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                            <Lock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">100% sécurisé</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
