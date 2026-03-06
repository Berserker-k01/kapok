import { useEffect, useState } from 'react'
import axios from 'axios'
import { resolveImageUrl } from '../utils/imageUrl'

/**
 * Composant wrapper qui gère le branding (favicon + titre) 
 * pour TOUTES les pages d'un sous-domaine boutique.
 * 
 * Enveloppe les routes du shop (PublicShop, Checkout, ThankYou, etc.)
 * pour que le favicon et le titre restent cohérents sur toutes les pages.
 */
const ShopBranding = ({ slug, children }) => {
    const [shopData, setShopData] = useState(null)

    useEffect(() => {
        if (!slug) return

        const fetchShop = async () => {
            try {
                const response = await axios.get(`/shops/public/${slug}`)
                const shop = response.data?.data?.shop
                if (shop) {
                    setShopData(shop)
                }
            } catch (err) {
                console.error('[ShopBranding] Erreur récupération boutique:', err.message)
            }
        }

        fetchShop()
    }, [slug])

    // Mettre à jour le titre et favicon dès que les données sont disponibles
    useEffect(() => {
        if (!shopData) return

        // Titre de l'onglet
        document.title = `${shopData.name} | Propulsé par Assimε`

        // Favicon
        const logoUrl = resolveImageUrl(
            shopData?.settings?.themeConfig?.content?.logoUrl || shopData?.logo_url
        )
        if (logoUrl) {
            let link = document.querySelector("link[rel~='icon']")
            if (!link) {
                link = document.createElement('link')
                link.rel = 'icon'
                document.head.appendChild(link)
            }
            link.href = logoUrl
        }

        // Nettoyage au démontage
        return () => {
            document.title = "Assimε"
            let link = document.querySelector("link[rel~='icon']")
            if (link) {
                link.href = "/favicon.png"
            }
        }
    }, [shopData])

    return children
}

export default ShopBranding
