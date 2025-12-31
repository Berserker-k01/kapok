/**
 * Utilitaire pour gérer le Pixel Facebook
 * Permet de tracker les événements e-commerce (AddToCart, Purchase, etc.)
 */

// Initialiser le Pixel Facebook
export const initFacebookPixel = (pixelId) => {
  if (!pixelId || typeof window === 'undefined') return

  // Vérifier si le pixel est déjà initialisé
  if (window.fbq) {
    console.log('Facebook Pixel déjà initialisé')
    return
  }

  // Code standard Facebook Pixel
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;
    n=f.fbq=function(){
      n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)
    };
    if(!f._fbq)f._fbq=n;
    n.push=n;
    n.loaded=!0;
    n.version='2.0';
    n.queue=[];
    t=b.createElement(e);
    t.async=!0;
    t.src=v;
    s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

  // Initialiser le pixel
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  console.log(`Facebook Pixel ${pixelId} initialisé`)
}

// Vérifier si le pixel est disponible
export const isPixelReady = () => {
  return typeof window !== 'undefined' && window.fbq
}

// Tracker un événement personnalisé
export const trackEvent = (eventName, parameters = {}) => {
  if (!isPixelReady()) {
    console.warn('Facebook Pixel non initialisé')
    return
  }

  window.fbq('track', eventName, parameters)
  console.log(`Facebook Pixel: ${eventName}`, parameters)
}

// Événements e-commerce standards
export const trackPageView = () => {
  trackEvent('PageView')
}

export const trackViewContent = (contentName, contentCategory, value, currency = 'XOF') => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
    value: value,
    currency: currency
  })
}

export const trackAddToCart = (product, quantity = 1) => {
  trackEvent('AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * quantity,
    currency: product.currency || 'XOF',
    num_items: quantity
  })
}

export const trackInitiateCheckout = (cartItems, totalValue, currency = 'XOF') => {
  const contents = cartItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
    item_price: item.price
  }))

  trackEvent('InitiateCheckout', {
    content_type: 'product',
    contents: contents,
    value: totalValue,
    currency: currency,
    num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  })
}

export const trackPurchase = (orderData) => {
  const { orderId, value, currency = 'XOF', items } = orderData

  const contents = items.map(item => ({
    id: item.productId || item.id,
    quantity: item.quantity,
    item_price: item.price || (item.total / item.quantity)
  }))

  trackEvent('Purchase', {
    content_type: 'product',
    contents: contents,
    value: value,
    currency: currency,
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    order_id: orderId
  })
}

export const trackSearch = (searchString) => {
  trackEvent('Search', {
    search_string: searchString
  })
}

export const trackAddPaymentInfo = (value, currency = 'XOF') => {
  trackEvent('AddPaymentInfo', {
    value: value,
    currency: currency
  })
}

export const trackCompleteRegistration = (method = 'email') => {
  trackEvent('CompleteRegistration', {
    status: true,
    method: method
  })
}

// Formater les données produit pour Facebook
export const formatProductForPixel = (product) => {
  return {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: product.currency || 'XOF'
  }
}

