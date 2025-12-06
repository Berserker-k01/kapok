import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { ShoppingBag, Truck, CheckCircle, Loader } from 'lucide-react'

const codSchema = z.object({
    firstName: z.string().min(2, 'Le prénom est requis'),
    lastName: z.string().min(2, 'Le nom est requis'),
    phone: z.string().min(8, 'Numéro de téléphone invalide'),
    address: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
    quantity: z.number().min(1, 'Au moins 1 article'),
})

const CheckoutCOD = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const [isSuccess, setIsSuccess] = useState(false)
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
        resolver: zodResolver(codSchema),
        defaultValues: {
            quantity: 1
        }
    })

    const quantity = watch('quantity')

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Utiliser la route publique existante pour récupérer les infos du produit
                // Note: On utilise ici une route produit publique (à créer si elle n'existe pas, ou adapter)
                // Pour l'instant on suppose qu'on peut récupérer le produit via une route publique
                const response = await axios.get(`http://localhost:5000/api/products/${productId}`)
                setProduct(response.data.data.product)
            } catch (error) {
                console.error('Erreur chargement produit:', error)
                toast.error("Impossible de charger le produit.")
            } finally {
                setLoading(false)
            }
        }
        if (productId) {
            fetchProduct()
        }
    }, [productId])

    const onSubmit = async (data) => {
        if (!product) return

        try {
            await axios.post('http://localhost:5000/api/orders/public', {
                ...data,
                items: [{ productId: product.id, quantity: data.quantity }],
                shopId: product.shop_id
            })

            setIsSuccess(true)
            toast.success('Commande enregistrée avec succès !')
        } catch (error) {
            console.error('Erreur commande:', error)
            toast.error("Une erreur est survenue lors de la commande.")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Produit introuvable.</p>
            </div>
        )
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
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Passer une autre commande
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Récapitulatif Produit */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Votre Panier
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-4">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-md" />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                        <ShoppingBag />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                                    <p className="text-gray-500 text-sm mt-1">Quantité: {quantity}</p>
                                    <p className="text-primary-600 font-bold mt-2 text-lg">
                                        {(product.price * quantity).toFixed(2)} {product.currency || '€'}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardBody className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900">Livraison Gratuite & Paiement à la livraison</h4>
                                <p className="text-blue-700 text-sm mt-1">
                                    Commandez maintenant et payez uniquement lorsque vous recevez votre colis.
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Formulaire */}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setValue('quantity', Math.max(1, quantity - 1))}
                                    >-</Button>
                                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setValue('quantity', quantity + 1)}
                                    >+</Button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="w-full text-lg py-6"
                                >
                                    Commander Maintenant - {(product.price * quantity).toFixed(2)} {product.currency || '€'}
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
    )
}

export default CheckoutCOD
