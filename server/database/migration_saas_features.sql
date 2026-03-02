-- Migration: Add SaaS features to shops table for existing installations
-- Cette migration ajoute les colonnes pour Google Sheets et les notifications
ALTER TABLE shops ADD COLUMN IF NOT EXISTS google_sheet_id VARCHAR(255);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN shops.google_sheet_id IS 'ID de la Google Sheet pour la synchronisation automatique des commandes';
COMMENT ON COLUMN shops.whatsapp_number IS 'Numéro WhatsApp pour recevoir les notifications de commande';
COMMENT ON COLUMN shops.notification_email IS 'Email pour recevoir les notifications de commande';
