import { useState, useEffect } from 'react'
import { FiShoppingCart, FiImage, FiBox, FiHeart, FiEye, FiArrowRight } from 'react-icons/fi'
import { formatCurrency } from '../../../utils/currency'

const ThemeMinimal = ({ shop, products, addToCart, cart }) => {
  const [scrolled, setScrolled] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans smooth-scroll">
      {/* Premium Header with Glassmorphism */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'glass shadow-xl py-3 backdrop-blur-2xl'
            : 'bg-white/80 backdrop-blur-md py-5 shadow-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo with animation */}
            <div className="flex items-center space-x-3 group">
              {shop?.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="h-12 w-12 object-contain rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">
                    {shop?.name?.charAt(0) || 'S'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
                  {shop?.name || 'Ma Boutique'}
                </h1>
                {shop?.description && (
                  <p className="text-xs text-gray-500 font-medium">Boutique en ligne</p>
                )}
              </div>
            </div>

            {/* Cart Button - Premium */}
            <button className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                <FiShoppingCart className="w-5 h-5" />
                <span className="font-bold text-lg">{cart?.length || 0}</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Hero Section - Absolutely Stunning */}
      {shop?.banner_url && (
        <section className="relative overflow-hidden mb-16">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-pink-500/20"></div>

          {/* Banner Image with Parallax Effect */}
          <div className="relative h-[70vh] overflow-hidden">
            <img
              src={shop.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-4xl px-6 space-y-8 animate-fade-in-up">
                <h2 className="text-6xl md:text-7xl font-black text-white leading-tight">
                  {shop.name}
                </h2>
                <p className="text-xl md:text-2xl text-gray-100 font-medium max-w-2xl mx-auto leading-relaxed">
                  {shop.description || "Découvrez notre collection exclusive"}
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button className="group relative px-10 py-5 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 group-hover:scale-110 transition-transform duration-300"></div>
                    <span className="relative text-gray-900 font-bold text-lg flex items-center gap-3">
                      Découvrir
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section - Premium Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h3 className="text-5xl font-black text-gray-900">
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nos Produits
            </span>
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection soigneusement choisie pour vous
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {products?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Card with Hover Effect */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">

                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <FiImage className="w-20 h-20 text-gray-300" />
                      </div>
                    )}

                    {/* Quick View Badge */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl hover:scale-110 transition-transform cursor-pointer">
                        <FiEye className="w-5 h-5 text-gray-900" />
                      </div>
                    </div>

                    {/* Nouveau Badge */}
                    {index < 3 && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          NOUVEAU
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h4>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-3xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full relative group/btn overflow-hidden rounded-xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 group-hover/btn:scale-110 transition-transform duration-300"></div>
                      <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white font-bold">
                        <FiShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                        <span>Ajouter au panier</span>
                      </div>
                    </button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-3xl shadow-glow"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <FiBox className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit disponible</h3>
            <p className="text-gray-500">Revenez bientôt pour découvrir nos nouveautés</p>
          </div>
        )}
      </section>

      {/* Footer - Premium */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black">{shop?.name}</h3>
              <p className="text-gray-400">{shop?.description}</p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold">Liens rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">À propos</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Conditions</li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold">Suivez-nous</h4>
              <div className="flex gap-4">
                {['FiFacebook', 'FiInstagram', 'FiTwitter'].map((icon, i) => (
                  <div key={i} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all cursor-pointer hover:scale-110">
                    <FiHeart className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2024 {shop?.name}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ThemeMinimal
