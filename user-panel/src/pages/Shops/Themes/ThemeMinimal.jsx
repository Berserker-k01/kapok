import { useState, useEffect } from 'react'
import {
  FiShoppingCart,
  FiImage,
  FiBox,
  FiHeart,
  FiEye,
  FiArrowRight,
  FiCheck,
  FiX,
  FiTruck,
  FiShield,
  FiStar,
  FiSearch,
  FiFilter
} from 'react-icons/fi'
import { formatCurrency } from '../../../utils/currency'
import { useCart } from '../../../context/CartContext'

const ThemeMinimal = ({ shop, products }) => {
  const { addToCart, cart, setIsCartOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const {
    primary = '#000000',
    secondary = '#ffffff',
    background = '#ffffff',
    text = '#111827'
  } = shop?.settings?.themeConfig?.colors || {}

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get unique categories
  const categories = ['all', ...new Set(products?.map(p => p.category).filter(Boolean))]

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen font-sans selection:bg-black selection:text-white" style={{ backgroundColor: background, color: text }}>
      {/* Navbar - Sticky & Clean */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
          ? 'bg-white/95 backdrop-blur-lg border-gray-200 shadow-sm py-3'
          : 'bg-transparent border-transparent py-5'
          }`}
        style={{ color: scrolled ? text : (shop?.banner_url ? '#fff' : text) }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop?.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="h-10 w-auto object-contain" />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                style={{ backgroundColor: primary, color: secondary }}
              >
                {shop?.name?.charAt(0) || 'S'}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight hidden sm:block">{shop?.name}</span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105"
            style={{ color: 'inherit' }}
          >
            <FiShoppingCart className="w-6 h-6" />
            {cart?.length > 0 && (
              <span
                className="absolute -top-1 -right-1 text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                style={{ backgroundColor: primary, color: secondary }}
              >
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {shop?.banner_url ? (
            <div className="absolute inset-0">
              <img src={shop.banner_url} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${primary} 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center py-12 md:py-20">
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight leading-tight ${shop?.banner_url ? 'text-white drop-shadow-2xl' : ''}`}
            style={{ color: shop?.banner_url ? undefined : text }}>
            {shop?.name || 'Bienvenue'}
          </h1>
          <p className={`text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-medium px-4 ${shop?.banner_url ? 'text-gray-100' : 'text-gray-600'}`}>
            {shop?.description || "Découvrez notre sélection unique de produits de qualité."}
          </p>
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 shadow-2xl hover:shadow-3xl"
              style={{
                backgroundColor: shop?.banner_url ? '#fff' : primary,
                color: shop?.banner_url ? '#000' : secondary
              }}
            >
              Découvrir la collection
            </button>
            <div className={`flex items-center gap-2 text-sm ${shop?.banner_url ? 'text-white' : 'text-gray-600'}`}>
              <FiTruck className="w-5 h-5" />
              <span className="font-medium">Livraison gratuite</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 mb-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ focusRingColor: primary }}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none bg-white cursor-pointer min-w-[200px]"
                style={{ focusRingColor: primary }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes catégories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid - Enhanced */}
      <section id="products" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex items-end justify-between mb-8 md:mb-12 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1" style={{ color: text }}>
              {selectedCategory === 'all' ? 'Tous nos produits' : selectedCategory}
            </h2>
            <p className="text-sm text-gray-500">{filteredProducts?.length || 0} produit(s)</p>
          </div>
          <a href="#" className="hidden md:inline-flex items-center text-sm font-semibold border-b pb-0.5 hover:opacity-70 transition-opacity" style={{ borderColor: text, color: text }}>
            Voir tout <FiArrowRight className="ml-2" />
          </a>
        </div>

        {filteredProducts?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 shadow-md hover:shadow-xl transition-shadow">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
                      <FiImage size={40} />
                    </div>
                  )}

                  {/* Stock Badge */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {product.stock} restant(s)
                    </div>
                  )}

                  {/* Quick Add Button */}
                  <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 transform ${hoveredProduct === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full font-bold py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                      style={{ backgroundColor: primary, color: secondary }}
                    >
                      <FiShoppingCart size={16} /> Ajouter
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-sm md:text-base font-semibold group-hover:underline decoration-1 underline-offset-4 line-clamp-1 mb-1" style={{ color: text }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-base md:text-lg font-bold" style={{ color: primary }}>
                      {formatCurrency(product.price, product.currency || 'XOF')}
                    </p>
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <FiCheck size={12} /> En stock
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">Épuisé</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 md:py-32 bg-gray-50 rounded-2xl">
            <FiBox className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </section>

      {/* Trust Features - Enhanced */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-24 px-4 md:px-6 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: text }}>
            Pourquoi nous choisir ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: primary, color: secondary }}>
                <FiTruck size={28} />
              </div>
              <h4 className="font-bold text-lg mb-2" style={{ color: text }}>Livraison Rapide</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Expédition sous 24-48h partout au Sénégal</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: primary, color: secondary }}>
                <FiShield size={28} />
              </div>
              <h4 className="font-bold text-lg mb-2" style={{ color: text }}>Paiement Sécurisé</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Paiement à la livraison en toute sécurité</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: primary, color: secondary }}>
                <FiStar size={28} />
              </div>
              <h4 className="font-bold text-lg mb-2" style={{ color: text }}>Qualité Garantie</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Produits authentiques et de qualité supérieure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="h-8 w-auto object-contain" />
              ) : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: primary, color: secondary }}>
                  {shop?.name?.charAt(0) || 'S'}
                </div>
              )}
              <span className="font-bold text-lg">{shop?.name}</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><FiShoppingCart size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><FiHeart size={20} /></a>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2024 {shop?.name}. Tous droits réservés. • Propulsé par <span className="font-semibold">e-Assime</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal - Enhanced */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
              {/* Image */}
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
                    <FiImage size={100} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <button onClick={() => setSelectedProduct(null)} className="self-end p-2 hover:bg-gray-100 rounded-full transition-colors mb-4">
                  <FiX size={28} />
                </button>

                <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: text }}>{selectedProduct.name}</h2>

                <div className="flex items-center gap-3 mb-6">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: primary }}>
                    {formatCurrency(selectedProduct.price, selectedProduct.currency || 'XOF')}
                  </p>
                  {selectedProduct.stock > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      En stock
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Catégorie:</span>
                    <span className="font-semibold">{selectedProduct.category || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Disponibilité:</span>
                    <span className="font-semibold">{selectedProduct.stock > 0 ? `${selectedProduct.stock} en stock` : 'Rupture de stock'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description || 'Aucune description disponible pour ce produit.'}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stock <= 0}
                  className="w-full py-4 md:py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl"
                  style={{ backgroundColor: primary, color: secondary }}
                >
                  <FiShoppingCart size={24} />
                  {selectedProduct.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeMinimal
