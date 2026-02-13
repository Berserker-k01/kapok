/**
 * Résout une URL d'image pour qu'elle fonctionne en dev et en production.
 * 
 * En Docker/production: le frontend et l'API sont sur la même origine,
 * donc les chemins relatifs /api/uploads/... fonctionnent directement.
 * 
 * En dev avec Vite proxy: idem, le proxy redirige /api vers le backend.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return null

  // URL absolue → garder telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Data/Blob URLs → garder telles quelles
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  // Chemin relatif d'upload → fonctionne directement (même origine)
  if (url.startsWith('/api/uploads/') || url.startsWith('/uploads/')) {
    return url
  }

  return url
}

export default resolveImageUrl
