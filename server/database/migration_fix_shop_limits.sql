-- Migration pour corriger les limites de boutiques des plans
-- Date: 2026-02-09

-- Mettre à jour les plans existants avec les bonnes limites
UPDATE plans_config 
SET max_shops = 2 
WHERE plan_key = 'free';

UPDATE plans_config 
SET max_shops = 5 
WHERE plan_key = 'basic';

UPDATE plans_config 
SET max_shops = NULL 
WHERE plan_key = 'pro';

-- Ajouter une colonne duration_months si elle n'existe pas déjà
ALTER TABLE plans_config 
ADD COLUMN IF NOT EXISTS duration_months INT DEFAULT 1;

-- Mettre à jour les durées par défaut
UPDATE plans_config 
SET duration_months = 1 
WHERE duration_months IS NULL OR duration_months = 0;

-- Vérifier les résultats
SELECT plan_key, name, max_shops, duration_months, price, is_active 
FROM plans_config 
ORDER BY display_order;
