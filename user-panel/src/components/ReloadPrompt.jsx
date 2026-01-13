import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react'
import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Button from './ui/Button'
import { Download, RefreshCw } from 'lucide-react'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstallBtn, setShowInstallBtn] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstallBtn(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
        setDeferredPrompt(null)
        setShowInstallBtn(false)
    }

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {(offlineReady || needRefresh) && (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-80 animate-slide-in">
                    <div className="mb-2 text-sm text-gray-700">
                        {offlineReady
                            ? "L'application est prête pour une utilisation hors ligne."
                            : "Nouveau contenu disponible, cliquez pour mettre à jour."}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={close}>
                            Fermer
                        </Button>
                        {needRefresh && (
                            <Button size="sm" onClick={() => updateServiceWorker(true)}>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Mettre à jour
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {showInstallBtn && !needRefresh && (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-80 animate-slide-in">
                    <div className="mb-3 text-sm font-medium text-gray-900">
                        Installez l'application pour une meilleure expérience
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setShowInstallBtn(false)}>
                            Plus tard
                        </Button>
                        <Button size="sm" onClick={handleInstallClick}>
                            <Download className="w-4 h-4 mr-1" />
                            Installer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReloadPrompt
