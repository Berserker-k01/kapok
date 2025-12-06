import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { CheckCircle, Package } from 'lucide-react'

const OrderValidation = () => {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [validating, setValidating] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderId}/public`)
                setOrder(response.data)
            } catch (err) {
                setError('Commande introuvable ou lien invalide.')
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [orderId])

    const handleValidate = async () => {
        setValidating(true)
        try {
            await axios.post(`/api/orders/${orderId}/validate`)
            setSuccess(true)
            toast.success('Merci ! Votre commande a été validée.')
        } catch (err) {
            toast.error("Impossible de valider la commande (peut-être déjà validée ?)")
        } finally {
            setValidating(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center border-b border-gray-100 pb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Confirmation de Réception</h1>
                    <p className="text-gray-500 mt-2">Boutique : {order?.shop_name}</p>
                </CardHeader>

                <CardBody className="space-y-6 pt-6">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Commande N°</span>
                            <span className="font-medium">{order?.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Montant</span>
                            <span className="font-medium">{order?.total_amount} {order?.currency}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium">{new Date(order?.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {success ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-lg font-medium text-green-800">Merci !</p>
                            <p className="text-gray-600">Vous avez confirmé la bonne réception de votre commande.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-center text-gray-600 text-sm">
                                En cliquant sur le bouton ci-dessous, vous confirmez avoir bien reçu votre commande et qu'elle est conforme.
                            </p>
                            <Button
                                onClick={handleValidate}
                                isLoading={validating}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Je confirme la réception
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}

export default OrderValidation
