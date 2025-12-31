# Guide d'Intégration Facebook Pixel

Ce guide explique comment utiliser le système de tracking Facebook Pixel intégré dans la plateforme Lesigne.

## 📋 Vue d'ensemble

Le système de tracking Facebook Pixel permet de :
- ✅ Suivre les conversions (achats, ajouts au panier, etc.)
- ✅ Créer des audiences personnalisées
- ✅ Optimiser les publicités Facebook
- ✅ Mesurer le ROI des campagnes publicitaires

## 🔧 Configuration

### Pour les propriétaires de boutiques

1. **Obtenir votre ID Pixel Facebook**
   - Connectez-vous à votre compte Facebook Business Manager
   - Allez dans **Événements** > **Pixels**
   - Copiez votre ID Pixel (ex: `123456789012345`)

2. **Configurer dans votre boutique**
   - Allez dans **Paramètres de la boutique**
   - Section **Marketing & Tracking**
   - Collez votre ID Pixel Facebook
   - Sauvegardez

## 📊 Événements Trackés Automatiquement

Le système track automatiquement les événements suivants :

### 1. **PageView**
- **Quand** : À chaque visite de la boutique
- **Données** : Aucune

### 2. **ViewContent**
- **Quand** : Quand un produit est affiché sur la page
- **Données** :
  - `content_name` : Nom du produit
  - `content_category` : "product"
  - `value` : Prix du produit
  - `currency` : Devise (XOF par défaut)

### 3. **AddToCart**
- **Quand** : Quand un produit est ajouté au panier
- **Données** :
  - `content_name` : Nom du produit
  - `content_ids` : ID du produit
  - `value` : Prix × quantité
  - `currency` : Devise
  - `num_items` : Quantité

### 4. **InitiateCheckout**
- **Quand** : Quand l'utilisateur arrive sur la page de checkout
- **Données** :
  - `contents` : Liste des produits dans le panier
  - `value` : Total du panier
  - `currency` : Devise
  - `num_items` : Nombre total d'articles

### 5. **AddPaymentInfo**
- **Quand** : Quand l'utilisateur commence à remplir le formulaire de paiement
- **Données** :
  - `value` : Montant total
  - `currency` : Devise

### 6. **Purchase**
- **Quand** : Quand une commande est confirmée avec succès
- **Données** :
  - `contents` : Liste des produits achetés
  - `value` : Montant total de la commande
  - `currency` : Devise
  - `num_items` : Nombre total d'articles
  - `order_id` : ID de la commande

## 💻 Utilisation dans le Code

### Utiliser le hook `useFacebookPixel`

```jsx
import { useFacebookPixel } from '../hooks/useFacebookPixel'

function MyComponent() {
  const { isReady } = useFacebookPixel('123456789012345')
  
  // Le pixel est automatiquement initialisé et PageView est tracké
  return <div>Ma page</div>
}
```

### Tracker des événements manuellement

```jsx
import { 
  trackAddToCart, 
  trackPurchase, 
  trackViewContent 
} from '../utils/facebookPixel'

// Ajouter au panier
trackAddToCart(product, quantity)

// Voir un produit
trackViewContent(product.name, 'product', product.price, 'XOF')

// Achat
trackPurchase({
  orderId: 'order_123',
  value: 10000,
  currency: 'XOF',
  items: [
    { id: 'prod_1', quantity: 2, price: 5000 }
  ]
})
```

## 🔍 Vérification

### Tester avec Facebook Pixel Helper

1. Installez l'extension [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) sur Chrome
2. Visitez votre boutique
3. L'extension vous montrera tous les événements trackés en temps réel

### Vérifier dans Facebook Events Manager

1. Allez dans **Événements** > **Test Events**
2. Entrez l'URL de votre boutique
3. Les événements apparaîtront en temps réel

## ⚠️ Notes Importantes

- Le pixel ne fonctionne que sur les **pages publiques** des boutiques
- Les événements sont trackés uniquement si un ID Pixel est configuré
- Le pixel est automatiquement désactivé en mode développement local (sauf si explicitement activé)
- Les données sont envoyées à Facebook de manière asynchrone

## 🐛 Dépannage

### Le pixel ne se charge pas
- Vérifiez que l'ID Pixel est correctement configuré dans les paramètres
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que le blocage de publicités n'est pas activé

### Les événements ne sont pas trackés
- Utilisez Facebook Pixel Helper pour diagnostiquer
- Vérifiez que `isPixelReady()` retourne `true` avant de tracker
- Vérifiez les logs de la console

## 📚 Ressources

- [Documentation officielle Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Guide des événements e-commerce](https://developers.facebook.com/docs/meta-pixel/reference)
- [Facebook Business Manager](https://business.facebook.com/)

