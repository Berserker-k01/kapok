import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiMinimize2, FiLock } from 'react-icons/fi'
import { Sparkles, Crown, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

// Plans qui ont accès à l'IA (doit correspondre au backend)
const AI_ALLOWED_PLANS = ['premium', 'gold']

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { id: 1, text: "Bonjour ! Je suis l'assistant IA de Assimε. Comment puis-je vous aider aujourd'hui ?", sender: 'ai' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)
    const navigate = useNavigate()
    const { user } = useAuthStore()

    // Vérifier l'accès IA selon le plan
    const userPlan = user?.plan || 'free'
    const hasAIAccess = AI_ALLOWED_PLANS.includes(userPlan)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = { id: Date.now(), text: input, sender: 'user' }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        try {
            const apiMessages = [...messages, userMessage].map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })).slice(-10);

            const response = await axios.post('/api/ai/chat', { messages: apiMessages });
            const reply = response.data.data.reply;

            setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai' }])
        } catch (error) {
            // Gérer spécifiquement le cas "plan insuffisant"
            if (error.response?.data?.code === 'AI_PLAN_REQUIRED') {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "⭐ L'accès à l'IA nécessite un plan Premium ou Gold. Upgradez pour débloquer l'assistant IA !",
                    sender: 'ai',
                    isUpgradePrompt: true
                }])
            } else {
                toast.error("L'assistant a eu un petit problème...");
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "Désolé, je n'arrive pas à réfléchir pour le moment. Réessayez plus tard.", sender: 'ai' }])
            }
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 p-4 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
                        style={{
                            background: hasAIAccess
                                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                                : 'linear-gradient(135deg, #9ca3af, #6b7280)'
                        }}
                        title={hasAIAccess ? "Assistant IA Assimε" : "IA disponible avec un plan Premium"}
                    >
                        {hasAIAccess
                            ? <Sparkles className="w-6 h-6 animate-pulse" />
                            : <FiLock className="w-6 h-6" />
                        }
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[600px]"
                    >
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between text-white"
                            style={{ background: hasAIAccess ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(135deg, #9ca3af, #6b7280)' }}>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    {hasAIAccess ? <Sparkles className="w-5 h-5" /> : <FiLock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Assistant Assimε</h3>
                                    <p className="text-xs text-white/80 flex items-center">
                                        {hasAIAccess
                                            ? <><span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>En ligne — Plan {userPlan}</>
                                            : <><span className="w-2 h-2 bg-orange-400 rounded-full mr-1.5"></span>Plan Premium requis</>
                                        }
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                <FiMinimize2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Plan Gate — affiché si plan insuffisant */}
                        {!hasAIAccess ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white text-center">
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                                    <Crown className="w-8 h-8 text-amber-500" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg mb-2">Fonctionnalité Premium</h4>
                                <p className="text-gray-500 text-sm mb-2">
                                    L'assistant IA Assimε est disponible avec les plans
                                </p>
                                <div className="flex gap-2 mb-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Premium</span>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Gold</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-6">
                                    Votre plan actuel : <strong className="text-gray-600 uppercase">{userPlan}</strong>
                                </p>
                                <button
                                    onClick={() => { setIsOpen(false); navigate('/subscriptions') }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
                                >
                                    <Crown className="w-4 h-4" />
                                    Upgrader mon plan
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-[400px]">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`
                                                max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm
                                                ${msg.sender === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                }
                                            `}>
                                                {msg.text}
                                                {msg.isUpgradePrompt && (
                                                    <button
                                                        onClick={() => { setIsOpen(false); navigate('/subscriptions') }}
                                                        className="mt-2 flex items-center gap-1 text-xs text-purple-600 font-semibold hover:text-purple-800"
                                                    >
                                                        <Crown className="w-3 h-3" /> Voir les plans →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex space-x-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSend} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Posez une question..."
                                            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isTyping}
                                            className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                                        >
                                            <FiSend className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default AIAssistant

