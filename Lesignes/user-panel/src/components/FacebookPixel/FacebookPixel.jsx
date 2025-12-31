import { useEffect } from 'react'
import { useFacebookPixel } from '../../hooks/useFacebookPixel'

/**
 * Composant pour intégrer le Pixel Facebook
 * À placer dans les pages publiques des boutiques
 */
const FacebookPixel = ({ pixelId, children }) => {
  const { isReady } = useFacebookPixel(pixelId, true)

  // Le composant ne rend rien, il initialise juste le pixel
  return children || null
}

export default FacebookPixel

