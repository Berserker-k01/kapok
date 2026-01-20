import { useState, useEffect } from 'react'
import { FiShoppingCart, FiImage, FiBox, FiHeart, FiEye, FiArrowRight, FiCheck } from 'react-icons/fi'
import { formatCurrency } from '../../../utils/currency'

const ThemeMinimal = ({ shop, products, addToCart, cart }) => {
  const [scrolled, setScrolled] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState(null)

  const {
    primary = '#000000',
    secondary = '#ffffff',
    background = '#ffffff',
    text = '#111827' // gray-900 equivalent
  } = shop?.settings?.themeConfig?.colors || {}

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen font-sans selection:bg-black selection:text-white" style={{ backgroundColor: background, color: text }}>
      {/* Navbar - Sticky & Clean */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
          ? 'bg-white/90 backdrop-blur-md border-gray-100 py-4'
          : 'bg-transparent border-transparent py-6'
          }`}
        style={{ color: scrolled ? text : (shop?.banner_url ? '#fff' : text) }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop?.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="h-10 w-auto object-contain" />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl"
                style={{ backgroundColor: primary, color: secondary }}
              >
                {shop?.name?.charAt(0) || 'S'}
              </div>
            )}
            <span className={`font-bold text-xl tracking-tight`}>{shop?.name}</span>
          </div>

          <button
            className="relative p-3 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: 'inherit' }}
          >
            <FiShoppingCart className="w-6 h-6" />
            {cart?.length > 0 && (
              <span
                className="absolute top-1 right-1 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primary, color: secondary }}
              >
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section - Full & Bold */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background if no banner */}
        <div className="absolute inset-0 z-0">
          {shop?.banner_url ? (
            <div className="absolute inset-0">
              <img src={shop.banner_url} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gray-50"></div>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center py-20">
          <h1 className={`text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight ${shop?.banner_url ? 'text-white' : ''}`} style={{ color: shop?.banner_url ? undefined : text }}>
            {shop?.name || 'Bienvenue'}
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto font-medium ${shop?.banner_url ? 'text-gray-100' : 'text-gray-500'}`}>
            {shop?.description || "Une sélection unique de produits pour vous."}
          </p>
          <div className="mt-10">
            <button
              className={`px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg`}
              style={{
                backgroundColor: shop?.banner_url ? '#fff' : primary,
                color: shop?.banner_url ? '#000' : secondary
              }}
            >
              Découvrir la collection
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid - Clean & Spacious */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-4">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: text }}>Nouveautés</h2>
          <a href="#" className="hidden md:inline-flex items-center text-sm font-semibold border-b pb-0.5 hover:opacity-70" style={{ borderColor: text, color: text }}>
            Voir tout <FiArrowRight className="ml-2" />
          </a>
        </div>

        {products?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[1/1.2] bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FiImage size={40} />
                    </div>
                  )}

                  {/* Quick Add Button - Floating */}
                  <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 transform ${hoveredProduct === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="w-full font-bold py-3 rounded-lg shadow-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      style={{ backgroundColor: primary, color: secondary }}
                    >
                      <FiShoppingCart size={16} /> Ajouter
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium group-hover:underline decoration-1 underline-offset-4" style={{ color: text }}>
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold" style={{ color: text }}>
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-2xl">
            <FiBox className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun produit</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des produits à votre boutique.</p>
          </div>
        )}
      </section>

      {/* Trust / Features */}
      <section className="bg-gray-50 py-20 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: primary, color: secondary }}>
              <FiBox size={20} />
            </div>
            <h4 className="font-bold mb-2" style={{ color: text }}>Livraison Rapide</h4>
            <p className="text-sm text-gray-500">Expédition sous 24h pour toutes les commandes.</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: primary, color: secondary }}>
              <FiHeart size={20} />
            </div>
            <h4 className="font-bold mb-2" style={{ color: text }}>Service Client</h4>
            <p className="text-sm text-gray-500">Une équipe dédiée à votre écoute 7j/7.</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: primary, color: secondary }}>
              <FiCheck size={20} />
            </div>
            <h4 className="font-bold mb-2" style={{ color: text }}>Qualité Garantie</h4>
            <p className="text-sm text-gray-500">Satisfait ou remboursé sous 30 jours.</p>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">© 2024 {shop?.name}. Powered by Kapok.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-black transition-colors"><FiShoppingCart /></a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors"><FiHeart /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ThemeMinimal
