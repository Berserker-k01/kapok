/**
 * Résout une URL d'image pour qu'elle fonctionne en dev et en production.
 */

import axios from 'axios'

/**
 * Transforme une URL d'image relative en URL complète fonctionnelle.
 * @param {string} url - L'URL d'image (relative ou absolue)
 * @returns {string|null} L'URL résolue ou null si pas d'URL
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return null

  // Si c'est déjà une URL absolue complète (http/https), la garder telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Si c'est une data URL ou blob URL, la garder
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  // URL relative d'upload : /api/uploads/... ou /uploads/...
  if (url.startsWith('/api/uploads/') || url.startsWith('/uploads/')) {
    const apiBaseUrl = axios.defaults.baseURL || ''

    if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
      try {
        const origin = new URL(apiBaseUrl).origin
        return origin + url
      } catch (e) {
        return url
      }
    }

    return url
  }

  return url
}

export default resolveImageUrl

