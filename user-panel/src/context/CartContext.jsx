import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { trackAddToCart } from '../utils/facebookPixel'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children, initialPixelId }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('assime_cart')
            return savedCart ? JSON.parse(savedCart) : []
        } catch (e) {
            return []
        }
    })

    const [facebookPixelId, setFacebookPixelId] = useState(initialPixelId)

    useEffect(() => {
        localStorage.setItem('assime_cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id)
            if (existingItem) {
                toast.success('Quantité mise à jour')
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }
            toast.success('Ajouté au panier')
            return [...prev, { ...product, quantity }]
        })
        setIsCartOpen(true)

        // Tracker l'événement Facebook Pixel
        if (facebookPixelId) {
            trackAddToCart(product, quantity)
        }
    }

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return
        setCartItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ))
    }

    const clearCart = () => {
        setCartItems([])
    }

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartTotal,
            cartCount,
            setFacebookPixelId // Exposed for PublicShop
        }}>
            {children}
        </CartContext.Provider>
    )
}
