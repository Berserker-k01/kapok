import { FiShoppingBag, FiSearch, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { trackViewContent, isPixelReady } from '../../../utils/facebookPixel'
import { useEffect } from 'react'

const ThemeMinimal = ({ shop, products }) => {
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

    // Configuration dynamique des couleurs
    const colors = shop.settings?.themeConfig?.colors || {}
    const primaryColor = colors.primary || '#000000'
    const secondaryColor = colors.secondary || '#ffffff'
    const bgColor = colors.background || '#ffffff'
    const textColor = colors.text || '#111827'

    const customStyle = {
        backgroundColor: bgColor,
        color: textColor,
    }

    return (
        <div className="min-h-screen font-sans transition-colors duration-300" style={customStyle}>
            {/* Header Minimaliste */}
            <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="text-2xl font-light tracking-widest uppercase">
                        {shop.name}
                    </div>
                    <div className="flex items-center space-x-6 text-gray-400">
                        <FiSearch className="w-5 h-5 hover:text-gray-900 cursor-pointer transition-colors" />
                        <div className="relative hover:text-gray-900 cursor-pointer transition-colors" onClick={() => setIsCartOpen(true)}>
                            <FiShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section Épurée */}
            <section className="py-24 px-4 text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-thin tracking-tight text-gray-900">
                        {shop.description || "L'élégance dans la simplicité."}
                    </h1>
                    <p className="text-lg text-gray-500 font-light">
                        Découvrez notre nouvelle collection, conçue pour durer.
                    </p>
                </div>
            </section>

            {/* Grille Produits Classique */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {products.map((product) => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-4 relative">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-300 font-light">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-2">
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="px-6 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: primaryColor, color: secondaryColor }}
                                    >
                                        Ajouter
                                    </button>
                                    <Link
                                        to={`/checkout/cod/${product.id}`}
                                        className="border px-6 py-2 text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-all"
                                        style={{
                                            borderColor: primaryColor,
                                            color: primaryColor,
                                            '--hover-bg': primaryColor,
                                            '--hover-text': secondaryColor
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = primaryColor;
                                            e.target.style.color = secondaryColor;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.color = primaryColor;
                                        }}
                                    >
                                        Achat Rapide
                                    </Link>
                                </div>
                            </div>
                            <h3 className="text-sm text-gray-900 font-medium">{product.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{product.price} {product.currency || '€'}</p>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12 text-gray-400 font-light">
                        Aucun produit disponible pour le moment.
                    </div>
                )}
            </section>

            {/* Footer Simple */}
            <footer className="border-t border-gray-100 py-12 text-center">
                <p className="text-sm text-gray-400">© {new Date().getFullYear()} {shop.name}. Powered by Lesigne.</p>
            </footer>
        </div>
    )
}

export default ThemeMinimal
