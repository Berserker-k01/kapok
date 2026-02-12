/**
 * Résout une URL d'image pour qu'elle fonctionne en dev et en production.
 * 
 * Le problème : le backend retourne des URLs relatives comme "/api/uploads/fichier.jpg"
 * - En production (même domaine) : ça marche directement
 * - En dev local (localhost:3001 → API sur e-assime.com ou localhost:5000) : 
 *   le navigateur cherche l'image sur localhost:3001 où elle n'existe pas.
 * 
 * Cette fonction détecte les URLs relatives d'upload et les résout 
 * en se basant sur le baseURL d'axios.
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
    // En production (même origine), le chemin relatif fonctionne directement
    // En dev, on doit résoudre via le baseURL de l'API
    const apiBaseUrl = axios.defaults.baseURL || ''

    // Si le baseURL est absolu (https://e-assime.com/api), on extrait l'origine
    if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
      try {
        const origin = new URL(apiBaseUrl).origin
        // /api/uploads/file.jpg → https://e-assime.com/api/uploads/file.jpg
        return origin + url
      } catch (e) {
        return url
      }
    }

    // Si le baseURL est relatif (/api), le chemin relatif fonctionnera via le proxy
    return url
  }

  // Autre chemin relatif, retourner tel quel
  return url
}

export default resolveImageUrl

