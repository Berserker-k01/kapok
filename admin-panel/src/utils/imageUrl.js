/**
 * Résout une URL d'image pour qu'elle fonctionne en dev et en production.
 */
import axios from 'axios'

export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return null

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  if (url.startsWith('/api/uploads/') || url.startsWith('/uploads/')) {
    return url
  }

  return url
}

export default resolveImageUrl
