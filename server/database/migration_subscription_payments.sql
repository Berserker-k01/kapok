-- Migration pour ajouter le système de paiement manuel des abonnements
-- À exécuter si la base de données existe déjà

-- Table des plans configurables (Admin)
CREATE TABLE IF NOT EXISTS plans_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    max_shops INTEGER,
    features JSONB DEFAULT '[]',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des configurations de paiement (numéros de téléphone)
CREATE TABLE IF NOT EXISTS payment_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    provider_type VARCHAR(50) DEFAULT 'mobile_money' CHECK (provider_type IN ('mobile_money', 'bank', 'other')),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements d'abonnements (avec preuve de paiement)
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_key VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    payment_provider VARCHAR(100),
    payment_phone VARCHAR(20),
    proof_image_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_plans_config_plan_key ON plans_config(plan_key);
CREATE INDEX IF NOT EXISTS idx_plans_config_is_active ON plans_config(is_active);

-- Trigger pour updated_at sur les nouvelles tables
CREATE TRIGGER update_plans_config_updated_at BEFORE UPDATE ON plans_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_config_updated_at BEFORE UPDATE ON payment_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_payments_updated_at BEFORE UPDATE ON subscription_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données par défaut pour les plans (seulement si elles n'existent pas)
INSERT INTO plans_config (plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
SELECT 'free', 'Gratuit', 'Plan gratuit avec fonctionnalités de base', 0, 'XOF', 2, '["2 boutiques", "100 produits par boutique", "Support email"]', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM plans_config WHERE plan_key = 'free');

INSERT INTO plans_config (plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
SELECT 'basic', 'Basic', 'Plan basique pour les petites entreprises', 29999, 'XOF', 5, '["5 boutiques", "Produits illimités", "Support prioritaire", "Analytics avancées"]', TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM plans_config WHERE plan_key = 'basic');

INSERT INTO plans_config (plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
SELECT 'pro', 'Pro', 'Plan professionnel avec toutes les fonctionnalités', 99999, 'XOF', NULL, '["Boutiques illimitées", "Produits illimités", "Support 24/7", "Analytics complètes", "Thèmes premium"]', TRUE, 3
WHERE NOT EXISTS (SELECT 1 FROM plans_config WHERE plan_key = 'pro');

-- Données par défaut pour les numéros de paiement (seulement si elles n'existent pas)
INSERT INTO payment_config (provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT 'Orange Money', '+225 07 XX XX XX XX', 'mobile_money', TRUE, 1, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'Orange Money' AND phone_number = '+225 07 XX XX XX XX');

INSERT INTO payment_config (provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT 'MTN Mobile Money', '+225 05 XX XX XX XX', 'mobile_money', TRUE, 2, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'MTN Mobile Money' AND phone_number = '+225 05 XX XX XX XX');

INSERT INTO payment_config (provider_name, phone_number, provider_type, is_active, display_order, instructions)
SELECT 'Moov Money', '+225 01 XX XX XX XX', 'mobile_money', TRUE, 3, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'
WHERE NOT EXISTS (SELECT 1 FROM payment_config WHERE provider_name = 'Moov Money' AND phone_number = '+225 01 XX XX XX XX');

