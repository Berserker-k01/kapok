import {
    FiShoppingBag,
    FiArrowRight,
    FiX,
    FiImage,
    FiStar,
    FiTruck,
    FiShield,
    FiZap,
    FiHeart,
    FiSearch,
    FiFilter
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { trackViewContent, isPixelReady } from '../../../utils/facebookPixel'
import { useEffect, useState } from 'react'
import { formatCurrency } from '../../../utils/currency'

const ThemeBold = ({ shop, products }) => {
    const { addToCart, setIsCartOpen, cartCount } = useCart()
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // Tracker ViewContent pour chaque produit au chargement
    useEffect(() => {
        if (isPixelReady() && products.length > 0) {
            products.forEach(product => {
                trackViewContent(
                    product.name,
                    'product',
                    product.price,
                    product.currency || 'XOF'
                )
            })
        }
    }, [products])

    // Configuration dynamique
    const colors = shop.settings?.themeConfig?.colors || {}
    const primaryColor = colors.primary || '#fbbf24'
    const secondaryColor = colors.secondary || '#000000'
    const bgColor = colors.background || '#000000'
    const textColor = colors.text || '#ffffff'

    // Get unique categories
    const categories = ['all', ...new Set(products?.map(p => p.category).filter(Boolean))]

    // Filter products
    const filteredProducts = products?.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div
            className="min-h-screen font-display smooth-scroll selection:bg-yellow-400 selection:text-black transition-colors duration-300"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Header Impactant - Enhanced */}
            <header className="fixed top-0 w-full z-50 p-4 md:p-6 backdrop-blur-md bg-black/30 border-b border-white/10 transition-all duration-300">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        {shop?.logo_url && (
                            <img src={shop.logo_url} alt={shop.name} className="h-10 w-auto object-contain" />
                        )}
                        <div className="text-2xl md:text-4xl font-black tracking-tighter italic hover:scale-105 transition-transform duration-300"
                            style={{ color: primaryColor }}>
                            {shop.name.toUpperCase()}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-4 md:px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-2xl relative"
                        style={{ backgroundColor: textColor, color: bgColor }}
                    >
                        <FiShoppingBag className="animate-pulse" />
                        <span className="hidden sm:inline">PANIER</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-bounce"
                                style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Hero Section Massive - Enhanced */}
            <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20" style={{ backgroundColor: bgColor }}>
                {/* Animated Background */}
                {shop.settings?.themeConfig?.content?.bannerUrl ? (
                    <div className="absolute inset-0">
                        <img
                            src={shop.settings.themeConfig.content.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover opacity-40 animate-scale-in"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-yellow-500/10"></div>
                    </div>
                )}

                <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none animate-fade-in-up drop-shadow-2xl">
                        <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                            {shop.name.toUpperCase()}
                        </span>
                    </h1>
                    <p className="text-lg md:text-2xl lg:text-3xl font-bold mb-12 max-w-3xl mx-auto uppercase tracking-wide animate-fade-in-up animation-delay-200"
                        style={{ color: textColor, opacity: 0.95 }}>
                        {shop.description || "LE STYLE SANS COMPROMIS. OSEZ LA DIFFÉRENCE."}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
                        <a
                            href="#products"
                            className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-black uppercase tracking-wide hover:opacity-90 transition-all transform hover:scale-105 hover:shadow-2xl rounded-xl"
                            style={{ backgroundColor: primaryColor, color: secondaryColor }}
                        >
                            Voir la collection <FiArrowRight className="animate-pulse" />
                        </a>
                        <div className="flex items-center gap-2 text-sm md:text-base font-bold" style={{ color: textColor }}>
                            <FiTruck className="w-5 h-5" />
                            <span>LIVRAISON GRATUITE</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-black mb-2" style={{ color: primaryColor }}>{products?.length || 0}+</div>
                            <div className="text-xs md:text-sm uppercase tracking-wider opacity-80">Produits</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-black mb-2" style={{ color: primaryColor }}>100%</div>
                            <div className="text-xs md:text-sm uppercase tracking-wider opacity-80">Qualité</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-black mb-2" style={{ color: primaryColor }}>24/7</div>
                            <div className="text-xs md:text-sm uppercase tracking-wider opacity-80">Support</div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <FiArrowRight className="w-6 h-6 rotate-90" style={{ color: primaryColor }} />
                </div>
            </section>

            {/* Search & Filter - Bold Style */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 mb-16 relative z-20">
                <div className="rounded-2xl p-4 md:p-6 border-2 shadow-2xl backdrop-blur-md"
                    style={{ backgroundColor: `${bgColor}dd`, borderColor: primaryColor }}>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: primaryColor }} />
                            <input
                                type="text"
                                placeholder="RECHERCHER..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl font-bold uppercase tracking-wide focus:outline-none focus:ring-4 transition-all"
                                style={{
                                    backgroundColor: `${textColor}10`,
                                    color: textColor,
                                    borderColor: primaryColor,
                                    border: '2px solid transparent'
                                }}
                            />
                        </div>
                        <div className="relative">
                            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: primaryColor }} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="pl-12 pr-8 py-4 rounded-xl font-bold uppercase tracking-wide focus:outline-none focus:ring-4 appearance-none cursor-pointer min-w-[200px]"
                                style={{
                                    backgroundColor: `${textColor}10`,
                                    color: textColor,
                                    borderColor: primaryColor,
                                    border: '2px solid transparent'
                                }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} style={{ backgroundColor: bgColor }}>
                                        {cat === 'all' ? 'TOUTES' : cat.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid - Bold & Impactful */}
            <section id="products" className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
                <div className="flex items-center justify-between mb-12 pb-6 border-b-4" style={{ borderColor: primaryColor }}>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2" style={{ color: textColor }}>
                            {selectedCategory === 'all' ? 'COLLECTION' : selectedCategory.toUpperCase()}
                        </h2>
                        <p className="text-sm md:text-base font-bold uppercase tracking-wide opacity-70">
                            {filteredProducts?.length || 0} PRODUIT(S) DISPONIBLE(S)
                        </p>
                    </div>
                </div>

                {filteredProducts?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group cursor-pointer transform hover:scale-105 transition-all duration-500"
                                onClick={() => setSelectedProduct(product)}
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-xl hover:shadow-2xl transition-shadow border-2"
                                    style={{ borderColor: `${primaryColor}00`, borderWidth: '2px' }}>
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"
                                            style={{ backgroundColor: `${textColor}10` }}>
                                            <FiImage size={60} style={{ color: `${textColor}30` }} />
                                        </div>
                                    )}

                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                                className="w-full py-3 rounded-xl font-black uppercase tracking-wide text-sm md:text-base transition-all hover:scale-105 shadow-2xl"
                                                style={{ backgroundColor: primaryColor, color: secondaryColor }}
                                            >
                                                <FiShoppingBag className="inline mr-2" />
                                                AJOUTER
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stock Badge */}
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase"
                                            style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                                            {product.stock} RESTANT(S)
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div>
                                    <h3 className="font-black text-sm md:text-base uppercase tracking-tight mb-2 line-clamp-1 group-hover:underline decoration-2 underline-offset-4"
                                        style={{ color: textColor, textDecorationColor: primaryColor }}>
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg md:text-xl font-black" style={{ color: primaryColor }}>
                                            {formatCurrency(product.price, product.currency || 'XOF')}
                                        </p>
                                        {product.stock > 0 && (
                                            <span className="text-xs font-bold uppercase px-2 py-1 rounded-full"
                                                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                                                EN STOCK
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 rounded-2xl border-4 border-dashed" style={{ borderColor: `${textColor}20` }}>
                        <FiShoppingBag className="mx-auto h-20 w-20 mb-6" style={{ color: `${textColor}30` }} />
                        <h3 className="text-2xl font-black uppercase mb-2" style={{ color: textColor }}>Aucun produit trouvé</h3>
                        <p className="text-sm uppercase tracking-wide opacity-70">Modifiez vos critères de recherche</p>
                    </div>
                )}
            </section>

            {/* Trust Section - Bold Style */}
            <section className="py-20 md:py-32 px-4 md:px-6 border-y-4" style={{ borderColor: primaryColor, backgroundColor: `${textColor}05` }}>
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-3xl md:text-5xl font-black uppercase text-center mb-16 tracking-tighter" style={{ color: textColor }}>
                        POURQUOI NOUS ?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="text-center group">
                            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                                style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                                <FiZap size={40} />
                            </div>
                            <h4 className="font-black text-xl md:text-2xl uppercase mb-3" style={{ color: textColor }}>LIVRAISON ÉCLAIR</h4>
                            <p className="text-sm md:text-base opacity-80 uppercase tracking-wide">24-48H PARTOUT</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                                style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                                <FiShield size={40} />
                            </div>
                            <h4 className="font-black text-xl md:text-2xl uppercase mb-3" style={{ color: textColor }}>100% SÉCURISÉ</h4>
                            <p className="text-sm md:text-base opacity-80 uppercase tracking-wide">PAIEMENT PROTÉGÉ</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                                style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                                <FiStar size={40} />
                            </div>
                            <h4 className="font-black text-xl md:text-2xl uppercase mb-3" style={{ color: textColor }}>QUALITÉ PREMIUM</h4>
                            <p className="text-sm md:text-base opacity-80 uppercase tracking-wide">GARANTI À VIE</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Bold */}
            <footer className="py-12 px-4 md:px-6 border-t-4" style={{ borderColor: primaryColor }}>
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-3xl md:text-4xl font-black mb-4 tracking-tighter italic" style={{ color: primaryColor }}>
                        {shop.name.toUpperCase()}
                    </div>
                    <p className="text-sm uppercase tracking-wider opacity-70 mb-6">
                        © 2024 {shop.name}. TOUS DROITS RÉSERVÉS.
                    </p>
                    <p className="text-xs uppercase tracking-wider opacity-50">
                        PROPULSÉ PAR <span className="font-bold" style={{ color: primaryColor }}>E-ASSIME</span>
                    </p>
                </div>
            </footer>

            {/* Product Modal - Bold Style */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg" onClick={() => setSelectedProduct(null)}>
                    <div className="rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-4"
                        style={{ backgroundColor: bgColor, borderColor: primaryColor }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                            {/* Image */}
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-2"
                                style={{ borderColor: primaryColor }}>
                                {selectedProduct.image_url ? (
                                    <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${textColor}10` }}>
                                        <FiImage size={100} style={{ color: `${textColor}30` }} />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col">
                                <button onClick={() => setSelectedProduct(null)}
                                    className="self-end p-3 rounded-full transition-all hover:scale-110 mb-4"
                                    style={{ backgroundColor: `${textColor}10` }}>
                                    <FiX size={28} style={{ color: textColor }} />
                                </button>

                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4" style={{ color: textColor }}>
                                    {selectedProduct.name}
                                </h2>

                                <p className="text-4xl md:text-5xl font-black mb-6" style={{ color: primaryColor }}>
                                    {formatCurrency(selectedProduct.price, selectedProduct.currency || 'XOF')}
                                </p>

                                <div className="rounded-xl p-4 mb-6 border-2" style={{ backgroundColor: `${textColor}05`, borderColor: `${primaryColor}30` }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold uppercase text-sm opacity-70">Catégorie:</span>
                                        <span className="font-black uppercase">{selectedProduct.category || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold uppercase text-sm opacity-70">Stock:</span>
                                        <span className="font-black uppercase">{selectedProduct.stock > 0 ? `${selectedProduct.stock} DISPO` : 'ÉPUISÉ'}</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-black uppercase text-lg mb-3" style={{ color: textColor }}>Description</h3>
                                    <p className="opacity-80 leading-relaxed">
                                        {selectedProduct.description || 'Aucune description disponible.'}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock <= 0}
                                    className="w-full py-5 rounded-2xl font-black text-lg uppercase tracking-wide transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-2xl"
                                    style={{ backgroundColor: primaryColor, color: secondaryColor }}
                                >
                                    <FiShoppingBag size={24} />
                                    {selectedProduct.stock > 0 ? 'AJOUTER AU PANIER' : 'RUPTURE DE STOCK'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ThemeBold
