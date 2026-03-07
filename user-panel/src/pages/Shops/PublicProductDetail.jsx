import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiChevronLeft, FiShoppingBag, FiCheck, FiImage, FiZap, FiShield } from 'react-icons/fi'
import { resolveImageUrl } from '../../utils/imageUrl'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../../components/Cart/CartDrawer'
import FacebookPixel from '../../components/FacebookPixel/FacebookPixel'

const formatCurrency = (amount, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount)
}

const PublicProductDetail = ({ overrideSlug }) => {
    const { productId } = useParams()
    // Priorité: slug du sous-domaine > 'current'
    let slug = overrideSlug || 'current'

    const [shop, setShop] = useState(null)
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeImage, setActiveImage] = useState(null)
    const [addedId, setAddedId] = useState(null)

    const { setFacebookPixelId, addToCart, cartItems } = useCart()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Shop
                const shopRes = await axios.get(`/shops/public/${slug}`)
                const shopData = shopRes.data?.data?.shop
                if (!shopData) throw new Error("Boutique introuvable")
                setShop(shopData)

                // Fetch Product
                const prodRes = await axios.get(`/products/${productId}`)
                const prodData = prodRes.data?.data?.product
                if (!prodData) throw new Error("Produit introuvable")

                setProduct(prodData)

                // Set Primary Image
                if (prodData.images && prodData.images.length > 0) {
                    setActiveImage(resolveImageUrl(prodData.images[0]))
                } else if (prodData.image_url) {
                    setActiveImage(resolveImageUrl(prodData.image_url))
                }
            } catch (err) {
                console.error(err)
                setError("Oups, impossible de charger ce produit.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug, productId])

    const facebookPixelId = shop?.settings?.facebookPixelId || shop?.tracking?.facebookPixelId
    useEffect(() => {
        if (facebookPixelId) setFacebookPixelId(facebookPixelId)
    }, [facebookPixelId, setFacebookPixelId])

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.stock > 0) {
            addToCart(product)
            setAddedId(product.id)
            setTimeout(() => setAddedId(null), 2000)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    if (error) return <div className="min-h-screen flex items-center text-red-500 justify-center flex-col gap-4">
        {error}
        <Link to="/" className="text-blue-500 underline">Retour à la boutique</Link>
    </div>

    const inThemeConfig = shop?.settings?.themeConfig?.colors || {}
    const primaryColor = inThemeConfig.primary || shop?.settings?.primaryColor || '#000000'
    const bgColor = inThemeConfig.background || shop?.settings?.bgColor || '#ffffff'
    const textColor = inThemeConfig.text || shop?.settings?.textColor || '#000000'
    const primaryTextColor = inThemeConfig.secondary || '#ffffff'
    const logoUrl = shop?.settings?.themeConfig?.content?.logoUrl || shop?.logo_url ? resolveImageUrl(shop?.settings?.themeConfig?.content?.logoUrl || shop?.logo_url) : null

    // Combine images into an array for gallery
    let images = []
    if (product.images && product.images.length > 0) {
        images = product.images.map(img => resolveImageUrl(img))
    } else if (product.image_url) {
        images = [resolveImageUrl(product.image_url)]
    }

    const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0

    return (
        <FacebookPixel pixelId={facebookPixelId}>
            <CartDrawer />
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor, color: textColor }}>

                {/* Header Rapide */}
                <header className="sticky top-0 z-40 bg-opacity-90 backdrop-blur-md shadow-sm border-b" style={{ borderColor: `${textColor}15`, backgroundColor: bgColor }}>
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-70 transition font-medium">
                            <FiChevronLeft className="w-5 h-5" /> Retour
                        </button>
                        <div className="font-bold text-lg hidden sm:flex items-center gap-2">
                            {logoUrl && <img src={logoUrl} alt={shop.name} className="h-8 max-w-[120px] object-contain" />}
                            {!logoUrl && shop.name}
                        </div>
                        <button
                            className="relative"
                            onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))} // Using generic event trick, let's keep CartDrawer functionality simple
                        >
                            <FiShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 text-[10px] w-5 h-5 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

                        {/* ─── GALLERY IMAGE ─── */}
                        <div className="flex flex-col gap-4">
                            {/* Main Image */}
                            <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: `${textColor}15`, backgroundColor: `${textColor}05` }}>
                                {activeImage ? (
                                    <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiImage className="w-20 h-20 opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 thumbnails-scrollbar">
                                    {images.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(imgUrl)}
                                            className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImage === imgUrl ? 'opacity-100 scale-100' : 'opacity-60 scale-95 hover:opacity-100'}`}
                                            style={{ borderColor: activeImage === imgUrl ? primaryColor : 'transparent' }}
                                        >
                                            <img src={imgUrl} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── INFOS PRODUIT ─── */}
                        <div className="flex flex-col lg:sticky lg:top-28 h-fit">
                            {product.category && (
                                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 opacity-80" style={{ color: primaryColor }}>
                                    {product.category}
                                </p>
                            )}

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <p className="text-3xl sm:text-4xl font-black mb-8" style={{ color: primaryColor }}>
                                {formatCurrency(product.price, product.currency || 'XOF')}
                            </p>

                            {/* Stock status */}
                            <div className="flex items-center gap-2 mb-8 inline-block">
                                {product.stock > 0 ? (
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-700">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        {product.stock > 10 ? 'En stock' : `Plus que ${product.stock} en stock`}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Rupture de stock
                                    </span>
                                )}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className={`w-full py-5 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-transparent ${addedId ? 'opacity-90' : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(0,0,0,0.16)] active:translate-y-0 active:scale-95'} disabled:opacity-40 disabled:cursor-not-allowed`}
                                style={addedId ? { backgroundColor: '#10b981', color: '#fff' } : { backgroundColor: primaryColor, color: primaryTextColor, borderColor: `${primaryColor}20` }}
                            >
                                {addedId ? (
                                    <><FiCheck className="w-6 h-6" /> Ajouté avec succès !</>
                                ) : (
                                    <><FiShoppingBag className="w-6 h-6" /> {product.stock > 0 ? 'Commander' : 'Indisponible'}</>
                                )}
                            </button>

                            {/* Trust badges */}
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="flex items-center gap-3 p-4 rounded-xl shadow-sm border" style={{ backgroundColor: `${textColor}03`, borderColor: `${textColor}08` }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                        <FiZap className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider">Livraison Rapide</span>
                                        <span className="text-[10px] opacity-60">Expédition 24/48h</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl shadow-sm border" style={{ backgroundColor: `${textColor}03`, borderColor: `${textColor}08` }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                        <FiShield className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider">Paiement Sécurisé</span>
                                        <span className="text-[10px] opacity-60">À la livraison / Mobile</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mt-12 pt-8 border-t" style={{ borderColor: `${textColor}15` }}>
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <span className="w-2 h-6 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                                        Description du produit
                                    </h3>
                                    <div className="prose prose-sm sm:prose-base max-w-none opacity-90 leading-relaxed space-y-4" style={{ color: textColor }}>
                                        {product.description.split('\n').map((line, i) => {
                                            if (line.trim().startsWith('- ')) {
                                                return <li key={i} className="ml-5 list-disc pl-2">{line.replace('- ', '')}</li>
                                            }
                                            return <p key={i}>{line}</p>
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </FacebookPixel>
    )
}

export default PublicProductDetail
