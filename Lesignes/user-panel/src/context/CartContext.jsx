import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('lesigne_cart')
            return savedCart ? JSON.parse(savedCart) : []
        } catch (e) {
            return []
        }
    })

    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('lesigne_cart', JSON.stringify(cartItems))
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
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    )
}
