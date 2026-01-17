import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiSearch, FiArrowRight, FiMenu, FiX, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi'
import { useCart } from '../../../context/CartContext'
import { trackViewContent, isPixelReady } from '../../../utils/facebookPixel'
import { formatCurrency } from '../../../utils/currency'

const ThemeMinimal = ({ shop, products }) => {
    const { addToCart, setIsCartOpen, cartCount } = useCart()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Tracker ViewContent
    useEffect(() => {
        if (isPixelReady() && products.length > 0) {
            products.forEach(product => {
                trackViewContent(product.name, 'product', product.price, product.currency || 'XOF')
            })
        }
    }, [products])

    // Configuration
    const themeConfig = shop.settings?.themeConfig || {}
    const colors = themeConfig.colors || {}
    const content = themeConfig.content || {}

    const primaryColor = colors.primary || '#1a1a1a'
    const secondaryColor = colors.secondary || '#ffffff'
    const bgColor = colors.background || '#ffffff'
    const textColor = colors.text || '#1a1a1a'

    const bannerUrl = content.bannerUrl
    const logoUrl = content.logoUrl
    const shopName = content.shopName || shop.name

    const customStyle = {
        backgroundColor: bgColor,
        color: textColor,
    }

    return (
        <div className="min-h-screen font-sans smooth-scroll selection:bg-purple-200 selection:text-purple-900" style={customStyle}>

            {/* Mobile Menu - Enhanced */}
            <div className={`fixed inset-0 z-[60] bg-white transform transition-all duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} md:hidden shadow-2xl`}>
                <div className="p-6 flex flex-col h-full bg-gradient-to-br from-white via-primary-50/30 to-white">
                    <div className="flex justify-between items-center mb-12 pb-4 border-b border-primary-100">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">{shopName}</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-primary-100 rounded-full transition-colors">
                            <FiX className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-4">
                        <a href="#" className="block py-3 px-4 text-lg font-medium text-gray-700 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-all duration-200">🏠 Accueil</a>
                        <a href="#products" className="block py-3 px-4 text-lg font-medium text-gray-700 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-all duration-200">🛍️ Collection</a>
                        <a href="#about" className="block py-3 px-4 text-lg font-medium text-gray-700 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-all duration-200">ℹ️ À propos</a>
                        <a href="#contact" className="block py-3 px-4 text-lg font-medium text-gray-700 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-all duration-200">✉️ Contact</a>
                    </nav>
                    <div className="space-y-4 pt-4 border-t border-primary-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">Suivez-nous</p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-3 bg-primary-100 hover:bg-primary-600 hover:text-white rounded-full transition-all duration-300">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-primary-100 hover:bg-primary-600 hover:text-white rounded-full transition-all duration-300">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-primary-100 hover:bg-primary-600 hover:text-white rounded-full transition-all duration-300">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled || !bannerUrl ? 'glass shadow-soft py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Left: Menu & Search */}
                    <div className="flex items-center space-x-4">
                        <FiMenu className={`w-6 h-6 cursor-pointer md:hidden transition-colors duration-300 ${!scrolled && bannerUrl ? 'text-white' : 'text-gray-900'}`} onClick={() => setIsMobileMenuOpen(true)} />
                        <FiSearch className={`w-5 h-5 hidden md:block cursor-pointer hover:opacity-70 transition-all duration-300 ${!scrolled && bannerUrl ? 'text-white' : 'text-gray-900'}`} />
                    </div>

                    {/* Center: Logo */}
                    <Link to={`/s/${shop.slug}`} className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 hover:scale-105">
                        {logoUrl ? (
                            <img src={logoUrl} alt={shopName} className="h-8 md:h-12 object-contain" />
                        ) : (
                            <span className={`text-xl md:text-2xl font-bold tracking-widest uppercase transition-colors duration-300 ${!scrolled && bannerUrl ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
                                {shopName}
                            </span>
                        )}
                    </Link>

                    {/* Right: Cart */}
                    <div className="flex items-center space-x-4">
                        <div
                            className={`relative cursor-pointer hover:opacity-70 transition-all duration-300 hover:scale-110 ${!scrolled && bannerUrl ? 'text-white' : 'text-gray-900'}`}
                            onClick={() => setIsCartOpen(true)}
                        >
                            <FiShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section - Enhanced */}
            {bannerUrl ? (
                <div className="relative w-full h-[70vh] md:h-[85vh] bg-gray-900 overflow-hidden">
                    <img src={bannerUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-tight animate-fade-in-up">
                            {shop.description ? shop.description.split('.')[0] : "Nouvelle Collection"}
                        </h1>
                        <a href="#products" className="group bg-white text-black px-8 py-3.5 rounded-lg uppercase tracking-widest text-sm font-bold hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-soft-lg hover:shadow-glow hover-lift flex items-center gap-2">
                            Découvrir
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            ) : (
                <div className="pt-36 pb-20 px-4 text-center bg-gradient-to-b from-primary-50 via-white to-white">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight animate-fade-in-up">
                        {shop.name}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        {shop.description || "Découvrez notre sél ection exclusive de produits."}
                    </p>
                </div>
            )}

            {/* Products Section */}
            <section id="products" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900">Nouveautés</h2>
                    <div className="text-sm border-b border-gray-900 pb-1 cursor-pointer hover:text-gray-600 hover:border-gray-600 transition-colors">
                        Tout voir
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                    {products.map((product, index) => (
                        <div key={product.id} className="group animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                            <div className="product-image rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-500 mb-4">
                                {/* Image */}
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                        <FiShoppingBag className="w-16 h-16 text-gray-300 mb-2" />
                                        <span className="text-xs text-gray-400 font-medium">Pas d'image</span>
                                    </div>
                                )}

                                {/* Overlay & Action Buttons on Desktop */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />

                                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 hidden md:flex flex-col gap-2">
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-lg rounded-md"
                                    >
                                        Ajouter au panier
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-left space-y-1">
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                    <Link to={`/checkout/cod/${product.id}`}>{product.name}</Link>
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-bold text-gray-900">
                                        {formatCurrency(product.price, product.currency || 'XOF')}
                                    </span>
                                    {product.stock && product.stock < 5 && product.stock > 0 && (
                                        <span className="text-xs text-orange-600 font-medium">Stock limité</span>
                                    )}
                                </div>
                            </div>

                            {/* Mobile 'Add' Button (Always accessible or simple icon) */}
                            <button
                                onClick={() => addToCart(product)}
                                className="md:hidden mt-3 w-full border border-gray-200 py-2 text-xs font-bold uppercase tracking-wider text-gray-900 hover:bg-gray-50"
                            >
                                Ajouter
                            </button>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="py-24 text-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
                    </div>
                )}
            </section>

            {/* Newsletter / Promo Section (Static for now, adds 'Shopify feel') */}
            <section className="bg-gray-900 text-white py-20 px-4">
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <h3 className="text-2xl font-light uppercase tracking-widest">Rejoignez la communauté</h3>
                    <p className="text-gray-400 font-light">Inscrivez-vous pour recevoir les dernières nouveautés et offres exclusives.</p>
                    <div className="flex border-b border-gray-600 pb-2">
                        <input type="email" placeholder="Votre email" className="bg-transparent w-full outline-none text-white placeholder-gray-600" />
                        <FiArrowRight className="text-gray-400 cursor-pointer hover:text-white" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        {/* Brand */}
                        <div className="space-y-4">
                            <span className="text-xl font-bold uppercase tracking-widest">{shopName}</span>
                            <p className="text-sm text-gray-500 max-w-xs">{shop.description}</p>
                        </div>

                        {/* Links */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest">Navigation</h4>
                            <div className="flex flex-col space-y-2 text-sm text-gray-500">
                                <a href="#" className="hover:text-black transition-colors">Accueil</a>
                                <a href="#products" className="hover:text-black transition-colors">Catalogue</a>
                                <a href="#" className="hover:text-black transition-colors">Contact</a>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest">Suivez-nous</h4>
                            <div className="flex space-x-4 text-gray-500">
                                <FiInstagram className="w-5 h-5 hover:text-black cursor-pointer transition-colors" />
                                <FiFacebook className="w-5 h-5 hover:text-black cursor-pointer transition-colors" />
                                <FiTwitter className="w-5 h-5 hover:text-black cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                        <p>© {new Date().getFullYear()} {shopName}. Tous droits réservés.</p>
                        <p className="mt-2 md:mt-0 flex items-center">
                            Powered by <span className="text-purple-600 font-bold ml-1">Assimε</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default ThemeMinimal
