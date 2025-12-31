import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { FiShoppingBag, FiSearch } from 'react-icons/fi'
import ThemeMinimal from './Themes/ThemeMinimal'
import ThemeBold from './Themes/ThemeBold'
import { CartProvider } from '../../context/CartContext'
import CartDrawer from '../../components/Cart/CartDrawer'
import FacebookPixel from '../../components/FacebookPixel/FacebookPixel'

const PublicShop = () => {
    const { slug } = useParams()
    const [shop, setShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const response = await axios.get(`/api/shops/public/${slug}`)
                setShop(response.data.data.shop)
            } catch (err) {
                setError("Boutique introuvable")
            } finally {
                setLoading(false)
            }
        }
        fetchShop()
    }, [slug])

    // Récupérer l'ID du pixel Facebook depuis les settings
    const facebookPixelId = shop?.settings?.facebookPixelId || shop?.tracking?.facebookPixelId

    // Stocker le pixelId dans localStorage pour l'utiliser dans le checkout
    useEffect(() => {
        if (facebookPixelId) {
            localStorage.setItem('lesigne_facebook_pixel_id', facebookPixelId)
        }
    }, [facebookPixelId])

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

    // Mock products pour la démo (en attendant l'API products publique complète)
    const products = [
        { id: 1, name: 'Produit Démo 1', price: 29.99, currency: '€', image_url: 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Produit+1' },
        { id: 2, name: 'Produit Démo 2', price: 49.99, currency: '€', image_url: 'https://placehold.co/600x800/e5e7eb/9ca3af?text=Produit+2' },
        { id: 3, name: 'Produit Démo 3', price: 19.99, currency: '€', image_url: 'https://placehold.co/600x800/d1d5db/6b7280?text=Produit+3' },
        { id: 4, name: 'Produit Démo 4', price: 89.99, currency: '€', image_url: 'https://placehold.co/600x800/9ca3af/4b5563?text=Produit+4' },
    ]

    // Sélection du thème (par défaut 'minimal')
    const currentTheme = shop?.settings?.theme || shop?.theme || 'minimal'

    return (
        <FacebookPixel pixelId={facebookPixelId}>
            <CartProvider facebookPixelId={facebookPixelId}>
                <CartDrawer />
                {currentTheme === 'bold' ? (
                    <ThemeBold shop={shop} products={products} />
                ) : (
                    <ThemeMinimal shop={shop} products={products} />
                )}
            </CartProvider>
        </FacebookPixel>
    )
}

export default PublicShop
