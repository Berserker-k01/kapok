import { useState, useEffect } from 'react'
import {
  FiShoppingCart,
  FiImage,
  FiBox,
  FiHeart,
  FiArrowRight,
  FiCheck,
  FiX,
  FiTruck,
  FiShield,
  FiStar,
  FiSearch,
  FiChevronDown,
  FiMinus,
  FiPlus,
  FiPackage,
  FiRefreshCw
} from 'react-icons/fi'
import { formatCurrency } from '../../../utils/currency'
import { useCart } from '../../../context/CartContext'

const ThemeMinimal = ({ shop, products }) => {
  const { addToCart, cart, setIsCartOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [addedProductId, setAddedProductId] = useState(null)

  const {
    primary = '#000000',
    secondary = '#ffffff',
    background = '#ffffff',
    text = '#111827'
  } = shop?.settings?.themeConfig?.colors || {}

  const logoUrl = shop?.settings?.themeConfig?.content?.logoUrl || shop?.logo_url
  const bannerUrl = shop?.settings?.themeConfig?.content?.bannerUrl || shop?.banner_url
  const hasBanner = !!bannerUrl

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Categories
  const categories = ['all', ...new Set(products?.map(p => p.category).filter(Boolean))]

  // Filter
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Add to cart with visual feedback
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation()
    addToCart(product)
    setAddedProductId(product.id)
    setTimeout(() => setAddedProductId(null), 1500)
  }

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: background, color: text }}>

      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : hasBanner ? 'bg-transparent' : 'bg-white border-b border-gray-100'
        }`}
      >
        {/* Announcement bar */}
        {!scrolled && (
          <div className="text-center py-2 text-xs font-medium tracking-wide transition-all duration-300"
            style={{ backgroundColor: primary, color: secondary }}>
            <FiTruck className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
            Livraison gratuite à partir de 25 000 F CFA
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={shop?.name} className="h-9 w-auto object-contain" />
              ) : (
                <div className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-base"
                  style={{ backgroundColor: primary, color: secondary }}>
                  {shop?.name?.charAt(0) || 'S'}
                </div>
              )}
              <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
                scrolled || !hasBanner ? 'text-gray-900' : 'text-white'
              }`}>
                {shop?.name}
              </span>
            </div>

            {/* Nav links - Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#products"
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled || !hasBanner ? 'text-gray-600' : 'text-white/80'
                }`}>
                Boutique
              </a>
              <a href="#about"
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled || !hasBanner ? 'text-gray-600' : 'text-white/80'
                }`}>
                À propos
              </a>
            </nav>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2.5 rounded-full transition-all hover:scale-105 ${
                scrolled || !hasBanner ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'
              }`}
            >
              <FiShoppingCart className="w-5 h-5" />
              {cart?.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[10px] font-bold h-4.5 w-4.5 min-w-[18px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: primary, color: secondary }}
                >
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden ${hasBanner ? 'pt-0' : 'pt-28'}`}>
        {hasBanner ? (
          <div className="relative h-[70vh] min-h-[500px] max-h-[700px]">
            <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
            <div className="relative z-10 h-full flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight max-w-2xl">
                  {shop?.name || 'Bienvenue'}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
                  {shop?.description || "Découvrez notre collection soigneusement sélectionnée."}
                </p>
                <button
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 shadow-xl"
                  style={{ backgroundColor: '#fff', color: '#000' }}
                >
                  Découvrir la collection
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4" style={{ color: text }}>
              {shop?.name || 'Bienvenue'}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              {shop?.description || "Découvrez notre collection soigneusement sélectionnée."}
            </p>
            <button
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: primary, color: secondary }}
            >
              Parcourir la boutique
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ─── FILTERS ─── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: text }}>
              {selectedCategory === 'all' ? 'Tous les produits' : selectedCategory}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{filteredProducts?.length || 0} produit{filteredProducts?.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white transition-all"
              />
            </div>

            {/* Category filter */}
            {categories.length > 2 && (
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Catégories' : cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT GRID ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredProducts?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <FiImage className="w-10 h-10 text-gray-300" />
                    </div>
                  )}

                  {/* Quick add */}
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`w-full py-2.5 rounded-lg font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                        addedProductId === product.id ? 'bg-green-600 text-white' : ''
                      }`}
                      style={addedProductId !== product.id ? { backgroundColor: primary, color: secondary } : {}}
                    >
                      {addedProductId === product.id ? (
                        <><FiCheck className="w-4 h-4" /> Ajouté !</>
                      ) : (
                        <><FiShoppingCart className="w-4 h-4" /> Ajouter au panier</>
                      )}
                    </button>
                  </div>

                  {/* Badges */}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      Plus que {product.stock}
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full">Épuisé</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:underline underline-offset-4 decoration-gray-300">
                  {product.name}
                </h3>
                <p className="text-sm font-bold" style={{ color: text }}>
                  {formatCurrency(product.price, product.currency || 'XOF')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <FiBox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-sm text-gray-500 mb-6">Essayez un autre terme de recherche.</p>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" /> Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </section>

      {/* ─── TRUST SECTION ─── */}
      <section id="about" className="border-t border-gray-100 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-white shadow-sm border border-gray-100"
                style={{ color: primary }}>
                <FiTruck className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-base text-gray-900 mb-2">Livraison rapide</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Expédition sous 24-48h. Suivi de commande en temps réel.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-white shadow-sm border border-gray-100"
                style={{ color: primary }}>
                <FiShield className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-base text-gray-900 mb-2">Paiement sécurisé</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Paiement à la livraison ou mobile money. 100% sécurisé.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-white shadow-sm border border-gray-100"
                style={{ color: primary }}>
                <FiPackage className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-base text-gray-900 mb-2">Qualité garantie</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Produits authentiques sélectionnés avec soin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={shop?.name} className="h-7 w-auto object-contain opacity-80" />
              ) : (
                <div className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: primary, color: secondary }}>
                  {shop?.name?.charAt(0) || 'S'}
                </div>
              )}
              <span className="font-semibold text-gray-700 text-sm">{shop?.name}</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {shop?.name}. Tous droits réservés · Propulsé par{' '}
              <span className="font-semibold text-gray-500">e-Assime</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ─── PRODUCT DETAIL MODAL ─── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-white w-full sm:max-w-4xl sm:rounded-2xl max-h-[95vh] overflow-y-auto shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg flex justify-end p-4 sm:p-5">
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-0 sm:gap-8 px-5 sm:px-8 pb-8">
              {/* Image */}
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-6 sm:mb-0">
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <FiImage className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <div className="flex-1">
                  {selectedProduct.category && (
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                      {selectedProduct.category}
                    </p>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: primary }}>
                    {formatCurrency(selectedProduct.price, selectedProduct.currency || 'XOF')}
                  </p>

                  {/* Stock indicator */}
                  <div className="flex items-center gap-2 mb-6">
                    {selectedProduct.stock > 0 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-sm text-green-700 font-medium">
                          {selectedProduct.stock > 10 ? 'En stock' : `Plus que ${selectedProduct.stock} en stock`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-sm text-red-600 font-medium">Rupture de stock</span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div className="mb-8">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Add to cart */}
                <button
                  onClick={(e) => {
                    handleAddToCart(selectedProduct, e)
                    setTimeout(() => setSelectedProduct(null), 800)
                  }}
                  disabled={selectedProduct.stock <= 0}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  style={{ backgroundColor: primary, color: secondary }}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {selectedProduct.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>

                {/* Trust micro */}
                <div className="flex items-center justify-center gap-6 mt-5 text-gray-400">
                  <div className="flex items-center gap-1.5 text-xs">
                    <FiTruck className="w-3.5 h-3.5" /> Livraison rapide
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <FiShield className="w-3.5 h-3.5" /> Paiement sécurisé
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeMinimal
