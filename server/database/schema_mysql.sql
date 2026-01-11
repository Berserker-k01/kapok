-- Schéma de base de données MySQL pour Lesigne Platform
-- Multi-tenant e-commerce platform
-- Converti depuis PostgreSQL vers MySQL

-- Désactiver les vérifications de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    avatar_url TEXT,
    settings JSON DEFAULT ('{}'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des boutiques
CREATE TABLE IF NOT EXISTS shops (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id CHAR(36) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    theme VARCHAR(100) DEFAULT 'default',
    logo_url TEXT,
    banner_url TEXT,
    domain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'under_review')),
    settings JSON DEFAULT ('{}'),
    seo_settings JSON DEFAULT ('{}'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_shops_owner_id (owner_id),
    INDEX idx_shops_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    category VARCHAR(100),
    tags JSON DEFAULT ('[]'),
    shop_id CHAR(36) NOT NULL,
    inventory INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    weight DECIMAL(8,2) DEFAULT 0,
    dimensions JSON DEFAULT ('{}'),
    images JSON DEFAULT ('[]'),
    variants JSON DEFAULT ('[]'),
    seo_title VARCHAR(255),
    seo_description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_products_shop_id (shop_id),
    INDEX idx_products_category (category),
    INDEX idx_products_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des clients
CREATE TABLE IF NOT EXISTS customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSON DEFAULT ('{}'),
    notes TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    shop_id CHAR(36) NOT NULL,
    customer_id CHAR(36),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'validated_by_customer', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'cancelled')),
    payment_method VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    shipping_address JSON,
    billing_address JSON,
    notes TEXT,
    tracking_number VARCHAR(255),
    fulfilled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_orders_shop_id (shop_id),
    INDEX idx_orders_customer_id (customer_id),
    INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id VARCHAR(255),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    product_snapshot JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    stripe_subscription_id VARCHAR(255),
    current_period_start DATETIME,
    current_period_end DATETIME,
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36),
    subscription_id CHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    method VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    transaction_id VARCHAR(255),
    gateway_response JSON,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    INDEX idx_payments_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des thèmes
CREATE TABLE IF NOT EXISTS themes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preview_url TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    settings_schema JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des paramètres de la plateforme (Admin)
CREATE TABLE IF NOT EXISTS platform_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des plans configurables (Admin)
CREATE TABLE IF NOT EXISTS plans_config (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    max_shops INTEGER,
    features JSON DEFAULT ('[]'),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plans_config_plan_key (plan_key),
    INDEX idx_plans_config_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des configurations de paiement (numéros de téléphone)
CREATE TABLE IF NOT EXISTS payment_config (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    provider_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    provider_type VARCHAR(50) DEFAULT 'mobile_money' CHECK (provider_type IN ('mobile_money', 'bank', 'other')),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des paiements d'abonnements (avec preuve de paiement)
CREATE TABLE IF NOT EXISTS subscription_payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    plan_key VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF' CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF', 'XAF', 'GNF')),
    payment_provider VARCHAR(100),
    payment_phone VARCHAR(20),
    proof_image_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    admin_notes TEXT,
    reviewed_by CHAR(36),
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_subscription_payments_user_id (user_id),
    INDEX idx_subscription_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Données de test
INSERT INTO themes (name, description, category, is_free) VALUES
('Default', 'Thème par défaut simple et élégant', 'general', TRUE),
('Fashion', 'Thème optimisé pour la mode', 'fashion', TRUE),
('Electronics', 'Thème pour produits électroniques', 'electronics', TRUE),
('Home & Garden', 'Thème pour maison et jardin', 'home', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Données de configuration par défaut
INSERT INTO platform_settings (`key`, value, description) VALUES
('platform_name', 'Assimε', 'Nom public de la plateforme'),
('support_email', 'support@assime.com', 'Email de support principal'),
('free_plan_shops_limit', '2', 'Nombre de boutiques gratuites par utilisateur'),
('free_plan_products_limit', '100', 'Nombre de produits max par boutique gratuite')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Données par défaut pour les plans
INSERT INTO plans_config (plan_key, name, description, price, currency, max_shops, features, is_active, display_order) VALUES
('free', 'Gratuit', 'Plan gratuit avec fonctionnalités de base', 0, 'XOF', 2, '["2 boutiques", "100 produits par boutique", "Support email"]', TRUE, 1),
('basic', 'Basic', 'Plan basique pour les petites entreprises', 29999, 'XOF', 5, '["5 boutiques", "Produits illimités", "Support prioritaire", "Analytics avancées"]', TRUE, 2),
('pro', 'Pro', 'Plan professionnel avec toutes les fonctionnalités', 99999, 'XOF', NULL, '["Boutiques illimitées", "Produits illimités", "Support 24/7", "Analytics complètes", "Thèmes premium"]', TRUE, 3)
ON DUPLICATE KEY UPDATE plan_key=plan_key;

-- Données par défaut pour les numéros de paiement
INSERT INTO payment_config (provider_name, phone_number, provider_type, is_active, display_order, instructions) VALUES
('Orange Money', '+225 07 XX XX XX XX', 'mobile_money', TRUE, 1, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'),
('MTN Mobile Money', '+225 05 XX XX XX XX', 'mobile_money', TRUE, 2, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'),
('Moov Money', '+225 01 XX XX XX XX', 'mobile_money', TRUE, 3, 'Effectuez le paiement et téléversez la capture d''écran de confirmation')
ON DUPLICATE KEY UPDATE provider_name=provider_name;

