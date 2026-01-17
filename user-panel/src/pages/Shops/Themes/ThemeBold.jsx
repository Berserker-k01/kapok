import { FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { trackViewContent, isPixelReady } from '../../../utils/facebookPixel'
import { useEffect } from 'react'

const ThemeBold = ({ shop, products }) => {
    const { addToCart, setIsCartOpen, cartCount } = useCart()

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
    const primaryColor = colors.primary || '#fbbf24' // yellow-400 default
    const secondaryColor = colors.secondary || '#000000'
    const bgColor = colors.background || '#000000'
    const textColor = colors.text || '#ffffff'

    return (
        <div
            className="min-h-screen font-display smooth-scroll selection:bg-yellow-400 selection:text-black transition-colors duration-300"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Header Impactant - Enhanced */}
            <header className="absolute top-0 w-full z-50 p-6 backdrop-blur-sm bg-black/20 transition-all duration-300">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="text-3xl md:text-4xl font-black tracking-tighter italic hover:scale-105 transition-transform duration-300" style={{ color: primaryColor }}>
                        {shop.name.toUpperCase()}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-soft-lg hover:shadow-glow"
                        style={{ backgroundColor: textColor, color: bgColor }}
                    >
                        <FiShoppingBag className="animate-pulse" />
                        <span>PANIER ({cartCount})</span>
                    </button>
                </div>
            </header>

            {/* Hero Section Massive - Enhanced */}
            <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
                {shop.settings?.themeConfig?.content?.bannerUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center opacity-50 animate-scale-in" style={{ backgroundImage: `url(${shop.settings.themeConfig.content.bannerUrl})` }}></div>
                ) : (
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                )}

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <h1
                        className="text-6xl md:text-9xl font-black tracking-tighter mb-6 leading-none animate-fade-in-up"
                    >
                        {shop.name.toUpperCase()}
                    </h1>
                    <p className="text-xl md:text-3xl font-bold mb-10 max-w-2xl mx-auto uppercase tracking-wide animate-fade-in-up animation-delay-200" style={{ color: textColor, opacity: 0.9 }}>
                        {shop.description || "LE STYLE SANS COMPROMIS. OSEZ LA DIFFÉRENCE."}
                    </p>
                    <a
                        href="#products"
                        className="inline-flex items-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wide hover:opacity-90 transition-all transform hover:scale-105 hover:shadow-glow rounded-lg animate-fade-in-up animation-delay-300"
                        style={{ backgroundColor: primaryColor, color: secondaryColor }}
                    >
                        Voir la collection <FiArrowRight className="animate-pulse" />
                    </a>
                </div>
            </section>

            {/* Produits Grille Large - Enhanced */}
            <section id="products" className="py-24 px-4 bg-black">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-16 border-l-8 pl-6 uppercase animate-slide-in-left" style={{ borderColor: primaryColor }}>
                        Nouveautés
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, index) => (
                            <div key={product.id} className="group bg-zinc-900 border-2 border-zinc-800 hover:border-opacity-100 transition-all duration-500 overflow-hidden rounded-lg shadow-soft hover:shadow-glow animate-fade-in-up" style={{animationDelay: `${index * 100}ms`, ['--tw-border-opacity']: 0, ['--hover-border-color']: primaryColor}}>
                                <div className="aspect-square overflow-hidden relative">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 font-bold text-xl">
                                            <FiShoppingBag className="w-20 h-20 mb-4" />
                                            <span>NO IMAGE</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-4 py-2 text-black font-black text-sm tracking-wider animate-pulse" style={{ backgroundColor: primaryColor }}>
                                        NOUVEAU
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-2 truncate group-hover:text-yellow-400 transition-colors">{product.name}</h3>
                                    <div className="flex justify-between items-end mt-6">
                                        <span className="text-4xl font-black" style={{ color: primaryColor }}>
                                            {product.price} {product.currency || '€'}
                                        </span>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="text-white border-b-2 border-white pb-1 font-bold transition-all duration-300 text-sm hover:scale-110" style={{ ['--hover-border-color']: primaryColor }}
                                                onMouseEnter={(e) => { e.target.style.color = primaryColor; e.target.style.borderColor = primaryColor; }}
                                                onMouseLeave={(e) => { e.target.style.color = 'white'; e.target.style.borderColor = 'white'; }}
                                            >
                                                AJOUTER
                                            </button>
                                            <Link to={`/checkout/cod/${product.id}`} className="text-zinc-500 border-b-2 border-zinc-500 pb-1 font-bold hover:text-white hover:border-white transition-all duration-300 text-sm">
                                                RAPIDE
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-lg">
                            <p className="text-zinc-500 text-xl font-bold">STOCK ÉPUISÉ</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-900 py-16 border-t border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="text-2xl font-black italic mb-4">{shop.name}</div>
                    <p className="text-zinc-500">© {new Date().getFullYear()} ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
        </div>
    )
}

export default ThemeBold
