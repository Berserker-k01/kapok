import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FiShoppingBag,
    FiArrowRight,
    FiX,
    FiImage,
    FiStar,
    FiTruck,
    FiShield,
    FiZap,
    FiSearch,
    FiChevronDown,
    FiCheck,
    FiPackage,
    FiRefreshCw
} from 'react-icons/fi'
import { useCart } from '../../../context/CartContext'
import { trackViewContent, trackAddToCart, isPixelReady } from '../../../utils/facebookPixel'
import { formatCurrency } from '../../../utils/currency'
import { resolveImageUrl } from '../../../utils/imageUrl'

const ThemeBold = ({ shop, products }) => {
    const { addToCart, setIsCartOpen, cartCount } = useCart()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [scrolled, setScrolled] = useState(false)
    const [addedProductId, setAddedProductId] = useState(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])



    // Dynamic config
    const colors = shop.settings?.themeConfig?.colors || {}
    const primaryColor = colors.primary || '#fbbf24'
    const secondaryColor = colors.secondary || '#000000'
    const bgColor = colors.background || '#0a0a0a'
    const textColor = colors.text || '#ffffff'

    const logoUrl = resolveImageUrl(shop?.settings?.themeConfig?.content?.logoUrl || shop?.logo_url)
    const bannerUrl = resolveImageUrl(shop?.settings?.themeConfig?.content?.bannerUrl || shop?.banner_url)

    // Categories
    const categories = ['all', ...new Set(products?.map(p => p.category).filter(Boolean))]

    // Filter
    const filteredProducts = products?.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleAddToCart = (product, e) => {
        if (e) e.stopPropagation()
        addToCart(product)
        setAddedProductId(product.id)
        // Pixel: AddToCart
        if (isPixelReady()) trackAddToCart(product, 1)
        setTimeout(() => setAddedProductId(null), 1500)
    }

    // Compute contrast text for primary color
    const primaryTextColor = secondaryColor

    return (
        <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: bgColor, color: textColor }}>

            {/* ─── HEADER ─── */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl shadow-lg' : ''
                }`} style={{
                    backgroundColor: scrolled ? `${bgColor}f0` : 'transparent',
                    borderBottom: scrolled ? `1px solid ${textColor}10` : 'none'
                }}>
                {/* Top bar */}
                {!scrolled && (
                    <div className="text-center py-2 text-xs font-bold tracking-[0.2em] uppercase"
                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                        <FiZap className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                        Livraison Express · Paiement Sécurisé
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            {logoUrl && (
                                <img src={logoUrl} alt={shop.name} className="h-10 w-auto object-contain" />
                            )}
                            <span className="text-xl md:text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
                                {shop.name?.toUpperCase()}
                            </span>
                        </div>

                        {/* Cart */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                        >
                            <FiShoppingBag className="w-4 h-4" />
                            <span className="hidden sm:inline">Panier</span>
                            {cartCount > 0 && (
                                <span className="ml-1 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                                    style={{ backgroundColor: primaryTextColor, color: primaryColor }}>
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── HERO ─── */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                {/* Background */}
                {bannerUrl ? (
                    <div className="absolute inset-0">
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor }}>
                        {/* Decorative elements */}
                        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15" style={{ backgroundColor: primaryColor }}></div>
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                )}

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 w-full">
                    <div className="max-w-3xl">
                        {/* Tagline */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.15em]"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}30` }}>
                            <FiStar className="w-3.5 h-3.5" />
                            Collection {new Date().getFullYear()}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
                            {shop.name?.toUpperCase()}
                        </h1>
                        <p className="text-lg md:text-xl opacity-80 mb-10 max-w-xl leading-relaxed font-medium">
                            {shop.description || "Découvrez des produits uniques, sélectionnés avec passion."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <a
                                href="#products"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-2xl"
                                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                            >
                                Voir la collection
                                <FiArrowRight className="w-4 h-4" />
                            </a>
                            <span className="text-sm font-medium opacity-60 flex items-center gap-2">
                                <FiTruck className="w-4 h-4" />
                                Livraison gratuite dès 25 000 F
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Défiler</span>
                    <div className="w-px h-8" style={{ backgroundColor: textColor }}></div>
                </div>
            </section>

            {/* ─── FILTERS ─── */}
            <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                            {selectedCategory === 'all' ? 'Collection' : selectedCategory}
                        </h2>
                        <p className="text-sm opacity-50 mt-1 font-medium">
                            {filteredProducts?.length || 0} produit{filteredProducts?.length !== 1 ? 's' : ''} disponible{filteredProducts?.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-initial sm:w-56">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" style={{ color: textColor }} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    backgroundColor: `${textColor}08`,
                                    color: textColor,
                                    border: `1px solid ${textColor}15`,
                                    '--tw-ring-color': primaryColor
                                }}
                            />
                        </div>

                        {/* Category */}
                        {categories.length > 2 && (
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 cursor-pointer"
                                    style={{
                                        backgroundColor: `${textColor}08`,
                                        color: textColor,
                                        border: `1px solid ${textColor}15`,
                                        '--tw-ring-color': primaryColor
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} style={{ backgroundColor: bgColor, color: textColor }}>
                                            {cat === 'all' ? 'Catégories' : cat}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none" style={{ color: textColor }} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── PRODUCT GRID ─── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {filteredProducts?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group cursor-pointer"
                                onClick={() => navigate('/product/' + product.id)}
                            >
                                {/* Image */}
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3"
                                    style={{ backgroundColor: `${textColor}08` }}>
                                    {product.image_url ? (
                                        <img
                                            src={resolveImageUrl(product.image_url)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiImage className="w-10 h-10" style={{ color: `${textColor}20` }} />
                                        </div>
                                    )}

                                    {/* Quick add overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button
                                            onClick={(e) => handleAddToCart(product, e)}
                                            className={`w-full py-2.5 rounded-lg font-bold text-sm shadow-2xl transition-all flex items-center justify-center gap-2 ${addedProductId === product.id ? 'bg-green-500 text-white' : ''
                                                }`}
                                            style={addedProductId !== product.id ? { backgroundColor: primaryColor, color: primaryTextColor } : {}}
                                        >
                                            {addedProductId === product.id ? (
                                                <><FiCheck className="w-4 h-4" /> Ajouté !</>
                                            ) : (
                                                <><FiShoppingBag className="w-4 h-4" /> Commander</>
                                            )}
                                        </button>
                                    </div>

                                    {/* Badges */}
                                    {product.stock > 0 && product.stock <= 5 && (
                                        <div className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                            {product.stock} restant{product.stock > 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${bgColor}80` }}>
                                            <span className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full"
                                                style={{ backgroundColor: textColor, color: bgColor }}>
                                                Épuisé
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:underline decoration-1 underline-offset-4"
                                    style={{ textDecorationColor: `${primaryColor}60` }}>
                                    {product.name}
                                </h3>
                                <p className="text-sm font-black" style={{ color: primaryColor }}>
                                    {formatCurrency(product.price, product.currency || 'XOF')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 rounded-2xl border border-dashed" style={{ borderColor: `${textColor}15` }}>
                        <FiShoppingBag className="mx-auto h-12 w-12 mb-4" style={{ color: `${textColor}25` }} />
                        <h3 className="text-lg font-bold mb-2">Aucun produit trouvé</h3>
                        <p className="text-sm opacity-50 mb-6">Modifiez vos critères de recherche.</p>
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}
                                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg transition-all hover:opacity-80"
                                style={{ border: `1px solid ${textColor}20`, color: textColor }}
                            >
                                <FiRefreshCw className="w-4 h-4" /> Réinitialiser
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* ─── TRUST SECTION ─── */}
            <section className="py-20 border-t" style={{ borderColor: `${textColor}08`, backgroundColor: `${textColor}03` }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                <FiZap className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-base mb-2">Livraison Express</h4>
                            <p className="text-sm opacity-50 leading-relaxed">24-48h partout. Suivi en temps réel.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                <FiShield className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-base mb-2">Paiement Sécurisé</h4>
                            <p className="text-sm opacity-50 leading-relaxed">Mobile Money & paiement à la livraison.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                <FiPackage className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-base mb-2">Qualité Premium</h4>
                            <p className="text-sm opacity-50 leading-relaxed">Produits authentiques et garantis.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="border-t py-10 px-4 sm:px-6 lg:px-8" style={{ borderColor: `${textColor}08` }}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        {logoUrl && (
                            <img src={logoUrl} alt={shop.name} className="h-7 w-auto object-contain opacity-80" />
                        )}
                        <span className="font-black text-sm tracking-tight" style={{ color: primaryColor }}>
                            {shop.name?.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-xs opacity-40">
                        © {new Date().getFullYear()} {shop.name}. Tous droits réservés · Propulsé par{' '}
                        <span className="font-bold" style={{ color: primaryColor }}>e-Assime</span>
                    </p>
                </div>
            </footer>


        </div>
    )
}

export default ThemeBold
