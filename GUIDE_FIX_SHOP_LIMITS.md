# 🔧 Guide de Résolution - Limites de Boutiques

## Problème
Malgré un plan Pro, la limite de boutiques est de 2 au lieu d'être illimitée.

## Cause
Les données dans la table `plans_config` ne sont pas à jour ou ont été modifiées.

## Solutions

### Solution 1: Via l'Interface Admin (Recommandé)

1. **Connectez-vous au panneau admin**
   - URL: `http://localhost:5174` (ou votre URL admin)
   - Email: `admin@assime.com`
   - Mot de passe: `admin123`

2. **Accédez à la gestion des plans**
   - Menu latéral → **Plans & Abonnements**

3. **Modifiez le plan Pro**
   - Cliquez sur l'icône **Edit** (crayon) du plan "Pro"
   - Dans le champ **"Nombre max de boutiques"**:
     - Laissez vide pour illimité
     - Ou entrez `9999` pour une limite très élevée
   - Cliquez sur **"Sauvegarder"**

4. **Vérifiez les autres plans**
   - **Free**: 2 boutiques
   - **Basic**: 5 boutiques
   - **Pro**: Vide (illimité) ou 9999

### Solution 2: Via SQL (Avancé)

1. **Ouvrez votre client MySQL** (phpMyAdmin, MySQL Workbench, etc.)

2. **Exécutez le script de diagnostic**
   ```bash
   # Depuis le dossier server/database
   mysql -u root -p votre_database < diagnostic_shop_limits.sql
   ```

3. **Ou exécutez manuellement ces requêtes**
   ```sql
   -- Vérifier l'état actuel
   SELECT plan_key, name, max_shops FROM plans_config;

   -- Corriger le plan Pro
   UPDATE plans_config 
   SET max_shops = NULL 
   WHERE plan_key = 'pro';

   -- Vérifier le résultat
   SELECT plan_key, name, max_shops FROM plans_config;
   ```

### Solution 3: Via le Script de Migration

1. **Exécutez le script de migration**
   ```bash
   cd server/database
   mysql -u root -p votre_database < migration_fix_shop_limits.sql
   ```

2. **Redémarrez le serveur**
   ```bash
   cd server
   npm run dev
   ```

## Vérification

### 1. Vérifier dans la base de données
```sql
SELECT plan_key, name, max_shops 
FROM plans_config 
WHERE plan_key = 'pro';
```

**Résultat attendu:**
```
plan_key | name | max_shops
---------|------|----------
pro      | Pro  | NULL
```

### 2. Vérifier dans l'application

1. Connectez-vous avec un compte Pro
2. Allez sur **"Mes Boutiques"**
3. Le texte devrait afficher: **"Gérez vos boutiques en ligne (X/∞)"**
   - Ou **"(X/9999)"** si vous avez mis 9999

### 3. Tester la création

1. Essayez de créer une nouvelle boutique
2. Vous ne devriez **pas** avoir de message d'erreur de limite
3. La boutique devrait se créer normalement

## Logs de Débogage

Pour voir ce qui se passe côté serveur:

```bash
# Dans le terminal du serveur, cherchez ces logs:
[ShopLimit] UserID: xxx, Plan: pro
[ShopLimit] Match found: pro, Max: null
```

Si vous voyez `Max: 2` au lieu de `null`, c'est que la DB n'est pas à jour.

## Notes Importantes

- **NULL** = Illimité (recommandé pour Pro)
- **9999** = Limite très élevée (alternative)
- **0** = Aucune boutique (ne pas utiliser)

## Support

Si le problème persiste après ces étapes:

1. Vérifiez que vous êtes bien connecté avec un compte **plan = 'pro'**
2. Vérifiez dans la table `users`:
   ```sql
   SELECT id, name, email, plan FROM users WHERE email = 'votre@email.com';
   ```
3. Videz le cache du navigateur et reconnectez-vous

## Fichiers Créés

- `migration_fix_shop_limits.sql` - Script de migration automatique
- `diagnostic_shop_limits.sql` - Script de diagnostic et vérification
- Ce guide - `GUIDE_FIX_SHOP_LIMITS.md`
