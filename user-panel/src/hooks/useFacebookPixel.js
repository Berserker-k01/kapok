import { useEffect, useRef } from 'react'
import { initFacebookPixel, isPixelReady, trackPageView } from '../utils/facebookPixel'

/**
 * Hook pour utiliser le Pixel Facebook
 * @param {string} pixelId - L'ID du pixel Facebook
 * @param {boolean} autoTrackPageView - Si true, track automatiquement PageView au montage
 */
export const useFacebookPixel = (pixelId, autoTrackPageView = true) => {
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!pixelId || initializedRef.current) return

    // Initialiser le pixel
    initFacebookPixel(pixelId)
    initializedRef.current = true

    // Tracker PageView si demandé
    if (autoTrackPageView && isPixelReady()) {
      // Petit délai pour s'assurer que le pixel est bien chargé
      setTimeout(() => {
        trackPageView()
      }, 100)
    }
  }, [pixelId, autoTrackPageView])

  return {
    isReady: isPixelReady(),
    pixelId
  }
}

