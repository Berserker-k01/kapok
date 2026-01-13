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

    // Produits réels
    const [products, setProducts] = useState([])

    useEffect(() => {
        const fetchShopAndProducts = async () => {
            try {
                // 1. Fetch Shop
                const shopRes = await axios.get(`/shops/public/${slug}`)
                const shopData = shopRes.data.data.shop
                setShop(shopData)

                // 2. Fetch Products for this shop
                if (shopData?.id) {
                    // Use the public products endpoint (we might need to ensure this route exists or use the generic one)
                    // The generic /products usually requires auth?
                    // Let's use the one logged earlier: /shop/:shopId/products or /products?shopId=...
                    // Check routes/products.js for public access?
                    // Assuming we need a public route for products:
                    const prodRes = await axios.get(`/products/public/shop/${shopData.id}`)
                    setProducts(prodRes.data.data.products || [])
                }
            } catch (err) {
                setError("Boutique introuvable")
            } finally {
                setLoading(false)
            }
        }
        fetchShopAndProducts()
    }, [slug])

    // Sélection du thème (par défaut 'minimal')
    const currentTheme = shop?.settings?.theme || shop?.theme || 'minimal'

    // Récupérer l'ID du pixel Facebook depuis les settings
    const facebookPixelId = shop?.settings?.facebookPixelId || shop?.tracking?.facebookPixelId

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

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
