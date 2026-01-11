-- Migration pour ajouter le système de paiement manuel des abonnements (Version MySQL)
-- À exécuter dans PHPMyAdmin ou MySQL Workbench
-- ATTENTION : Cela réinitialise les tables de configuration des paiements pour éviter les conflits
DROP TABLE IF EXISTS subscription_payments;
DROP TABLE IF EXISTS payment_config;
DROP TABLE IF EXISTS plans_config;

-- 1. Table des plans configurables (Admin)
CREATE TABLE IF NOT EXISTS plans_config (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    max_shops INTEGER,
    features JSON,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_currency_plans CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF'))
);

-- 2. Table des configurations de paiement
CREATE TABLE IF NOT EXISTS payment_config (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    provider_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    provider_type VARCHAR(50) DEFAULT 'mobile_money',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_type_payment CHECK (provider_type IN ('mobile_money', 'bank', 'other'))
);

-- 3. Table des paiements d'abonnements
CREATE TABLE IF NOT EXISTS subscription_payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    plan_key VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    payment_provider VARCHAR(100),
    payment_phone VARCHAR(20),
    proof_image_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by CHAR(36),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_currency_sub CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    CONSTRAINT chk_status_sub CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- Index pour les nouvelles tables
CREATE INDEX idx_subscription_payments_user_id ON subscription_payments(user_id);
CREATE INDEX idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX idx_plans_config_plan_key ON plans_config(plan_key);
CREATE INDEX idx_plans_config_is_active ON plans_config(is_active);

-- Données par défaut pour les plans
INSERT INTO plans_config (id, plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
SELECT UUID(), 'free', 'Gratuit', 'Plan gratuit avec fonctionnalités de base', 0, 'XOF', 2, '["2 boutiques", "100 produits par boutique", "Support email"]', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM plans_config WHERE plan_key = 'free');

INSERT INTO plans_config (id, plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
SELECT UUID(), 'basic', 'Basic', 'Plan basique pour les petites entreprises', 29999, 'XOF', 5, '["5 boutiques", "Produits illimités", "Support prioritaire", "Analytics avancées"]', TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM plans_config WHERE plan_key = 'basic');

INSERT INTO plans_config (id, plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
SELECT UUID(), 'pro', 'Pro', 'Plan professionnel avec toutes les fonctionnalités', 99999, 'XOF', NULL, '["Boutiques illimitées", "Produits illimités", "Support 24/7", "Analytics complètes", "Thèmes premium"]', TRUE, 3
WHERE NOT EXISTS (SELECT 1 FROM plans_config WHERE plan_key = 'pro');

-- Données par défaut pour les numéros de paiement
INSERT INTO payment_config (id, provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT UUID(), 'Orange Money', '+225 07 XX XX XX XX', 'mobile_money', TRUE, 1, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'Orange Money' AND phone_number = '+225 07 XX XX XX XX');

INSERT INTO payment_config (id, provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT UUID(), 'MTN Mobile Money', '+225 05 XX XX XX XX', 'mobile_money', TRUE, 2, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'MTN Mobile Money' AND phone_number = '+225 05 XX XX XX XX');

INSERT INTO payment_config (id, provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT UUID(), 'Moov Money', '+225 01 XX XX XX XX', 'mobile_money', TRUE, 3, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'Moov Money' AND phone_number = '+225 01 XX XX XX XX');

INSERT INTO payment_config (id, provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT UUID(), 'T-Money (Togo)', '+228 9X XX XX XX', 'mobile_money', TRUE, 4, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'T-Money (Togo)');

INSERT INTO payment_config (id, provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT UUID(), 'Moov Money (Togo)', '+228 9X XX XX XX', 'mobile_money', TRUE, 5, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'Moov Money (Togo)');

