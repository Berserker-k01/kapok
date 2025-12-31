import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart()
    const navigate = useNavigate()

    const handleCheckout = () => {
        setIsCartOpen(false)
        navigate('/checkout')
    }

    return (
        <Transition.Root show={isCartOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsCartOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-gray-900">Panier</Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                        onClick={() => setIsCartOpen(false)}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Fermer</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flow-root">
                                                    {cartItems.length === 0 ? (
                                                        <p className="text-center text-gray-500 py-10">Votre panier est vide.</p>
                                                    ) : (
                                                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                            {cartItems.map((product) => (
                                                                <li key={product.id} className="flex py-6">
                                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                        {product.image_url ? (
                                                                            <img
                                                                                src={product.image_url}
                                                                                alt={product.name}
                                                                                className="h-full w-full object-cover object-center"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                                        )}
                                                                    </div>

                                                                    <div className="ml-4 flex flex-1 flex-col">
                                                                        <div>
                                                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                                                <h3>{product.name}</h3>
                                                                                <p className="ml-4">{product.price} {product.currency || '€'}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-1 items-end justify-between text-sm">
                                                                            <div className="flex items-center gap-3 border rounded-md px-2 py-1">
                                                                                <button onClick={() => updateQuantity(product.id, Math.max(1, product.quantity - 1))} className="text-gray-500 hover:text-black">
                                                                                    <Minus className="w-4 h-4" />
                                                                                </button>
                                                                                <span className="font-medium">{product.quantity}</span>
                                                                                <button onClick={() => updateQuantity(product.id, product.quantity + 1)} className="text-gray-500 hover:text-black">
                                                                                    <Plus className="w-4 h-4" />
                                                                                </button>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeFromCart(product.id)}
                                                                                className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                                <span className="sr-only">Supprimer</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {cartItems.length > 0 && (
                                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <p>Sous-total</p>
                                                    <p>{cartTotal.toFixed(2)} €</p>
                                                </div>
                                                <p className="mt-0.5 text-sm text-gray-500">Taxes et frais de livraison calculés à l'étape suivante.</p>
                                                <div className="mt-6">
                                                    <Button
                                                        onClick={handleCheckout}
                                                        className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800"
                                                    >
                                                        Commander
                                                    </Button>
                                                </div>
                                                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                                    <p>
                                                        ou{' '}
                                                        <button
                                                            type="button"
                                                            className="font-medium text-black hover:text-gray-800"
                                                            onClick={() => setIsCartOpen(false)}
                                                        >
                                                            Continuer vos achats
                                                            <span aria-hidden="true"> &rarr;</span>
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default CartDrawer
