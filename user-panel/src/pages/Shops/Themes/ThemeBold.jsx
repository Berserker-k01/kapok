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
            className="min-h-screen font-sans selection:bg-yellow-400 selection:text-black transition-colors duration-300"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Header Impactant */}
            <header className="absolute top-0 w-full z-50 p-6">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="text-3xl font-black tracking-tighter italic" style={{ color: primaryColor }}>
                        {shop.name.toUpperCase()}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2"
                        style={{ backgroundColor: textColor, color: bgColor }}
                    >
                        <FiShoppingBag />
                        <span>PANIER ({cartCount})</span>
                    </button>
                </div>
            </header>

            {/* Hero Section Massive */}
            <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
                {shop.settings?.themeConfig?.content?.bannerUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${shop.settings.themeConfig.content.bannerUrl})` }}></div>
                ) : (
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                )}

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <h1
                        className="text-6xl md:text-9xl font-black tracking-tighter mb-6 leading-none"
                    >
                        {shop.name.toUpperCase()}
                    </h1>
                    <p className="text-xl md:text-2xl font-medium mb-10 max-w-2xl mx-auto" style={{ color: textColor, opacity: 0.8 }}>
                        {shop.description || "LE STYLE SANS COMPROMIS. OSEZ LA DIFFÉRENCE."}
                    </p>
                    <a
                        href="#products"
                        className="inline-flex items-center gap-3 px-8 py-4 text-lg font-black uppercase tracking-wide hover:opacity-90 transition-all transform hover:-translate-y-1"
                        style={{ backgroundColor: primaryColor, color: secondaryColor }}
                    >
                        Voir la collection <FiArrowRight />
                    </a>
                </div>
            </section>

            {/* Produits Grille Large */}
            <section id="products" className="py-24 px-4 bg-black">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-black mb-12 border-l-8 border-yellow-400 pl-6 uppercase">
                        Nouveautés
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group bg-zinc-900 border border-zinc-800 hover:border-yellow-400 transition-colors duration-300">
                                <div className="aspect-square overflow-hidden relative">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-zinc-600 font-bold text-xl">
                                            NO IMAGE
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 text-sm">
                                        NOUVEAU
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                                    <div className="flex justify-between items-end mt-4">
                                        <span className="text-3xl font-black text-yellow-400">
                                            {product.price} {product.currency || '€'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="text-white border-b-2 border-white pb-1 font-bold hover:text-yellow-400 hover:border-yellow-400 transition-colors"
                                            >
                                                AJOUTER
                                            </button>
                                            <Link to={`/checkout/cod/${product.id}`} className="text-zinc-500 border-b-2 border-zinc-500 pb-1 font-bold hover:text-white hover:border-white transition-colors text-sm">
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
