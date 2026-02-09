-- Script de diagnostic et correction des limites de boutiques
-- Exécuter ce script pour vérifier et corriger les limites

-- 1. Vérifier l'état actuel des plans
SELECT 
    plan_key,
    name,
    max_shops,
    price,
    currency,
    is_active,
    display_order
FROM plans_config
ORDER BY display_order;

-- 2. Corriger les limites si nécessaires
-- Plan Free: 2 boutiques
UPDATE plans_config 
SET max_shops = 2 
WHERE plan_key = 'free' AND (max_shops IS NULL OR max_shops != 2);

-- Plan Basic: 5 boutiques  
UPDATE plans_config 
SET max_shops = 5 
WHERE plan_key = 'basic' AND (max_shops IS NULL OR max_shops != 5);

-- Plan Pro: Illimité (NULL)
UPDATE plans_config 
SET max_shops = NULL 
WHERE plan_key = 'pro' AND max_shops IS NOT NULL;

-- 3. Vérifier le résultat après correction
SELECT 
    plan_key,
    name,
    CASE 
        WHEN max_shops IS NULL THEN 'Illimité'
        ELSE CAST(max_shops AS CHAR)
    END as limite_boutiques,
    price,
    is_active
FROM plans_config
ORDER BY display_order;

-- 4. Vérifier les utilisateurs avec plan Pro
SELECT 
    u.id,
    u.name,
    u.email,
    u.plan,
    COUNT(s.id) as nombre_boutiques
FROM users u
LEFT JOIN shops s ON s.owner_id = u.id
WHERE u.plan = 'pro'
GROUP BY u.id, u.name, u.email, u.plan;
