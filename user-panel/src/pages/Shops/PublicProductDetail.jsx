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

    const primaryColor = shop?.settings?.primaryColor || '#000000'
    const bgColor = shop?.settings?.bgColor || '#ffffff'
    const textColor = shop?.settings?.textColor || '#000000'

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
                        <div className="font-bold text-lg hidden sm:block">
                            {shop.name}
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
                        <div className="flex flex-col justify-center">
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
                                className={`w-full py-4 rounded-xl font-black text-sm sm:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-xl ${addedId ? 'opacity-90' : 'hover:scale-[1.02] hover:shadow-2xl'} disabled:opacity-40 disabled:cursor-not-allowed`}
                                style={addedId ? { backgroundColor: '#10b981', color: '#fff' } : { backgroundColor: primaryColor, color: shop?.settings?.primaryTextColor || '#ffffff' }}
                            >
                                {addedId ? (
                                    <><FiCheck className="w-5 h-5" /> Ajouté avec succès !</>
                                ) : (
                                    <><FiShoppingBag className="w-5 h-5" /> {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}</>
                                )}
                            </button>

                            {/* Description */}
                            {product.description && (
                                <div className="mt-12 pt-8 border-t" style={{ borderColor: `${textColor}15` }}>
                                    <h3 className="text-lg font-bold mb-4">Description</h3>
                                    <div className="prose prose-sm sm:prose-base opacity-80" style={{ color: textColor }}>
                                        {product.description.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2 leading-relaxed">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trust badges */}
                            <div className="flex items-center gap-8 mt-12 pt-8 border-t opacity-50" style={{ borderColor: `${textColor}15` }}>
                                <div className="flex flex-col gap-2">
                                    <FiZap className="w-6 h-6" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Livraison Rapide</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FiShield className="w-6 h-6" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Paiement Sécurisé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </FacebookPixel>
    )
}

export default PublicProductDetail
