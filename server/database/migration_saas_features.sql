-- =================================================================
-- Migration SaaS: Ajout des colonnes de notifications et Google Sheets
-- À exécuter dans le conteneur PostgreSQL Docker
-- Commande: docker exec -i assime-postgres psql -U assime_user -d assime_db < ./server/database/migration_saas_features.sql
-- =================================================================

-- 1. Nouvelles colonnes pour les boutiques
ALTER TABLE shops ADD COLUMN IF NOT EXISTS google_sheet_id VARCHAR(255);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 2. Vérification (affiche la structure mise à jour)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shops' 
ORDER BY ordinal_position;
