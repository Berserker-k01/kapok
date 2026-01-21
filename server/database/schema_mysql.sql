-- Schéma de base de données MySQL pour Lesigne Platform (MASTER FINAL V1)
-- Inclut : Core, E-commerce, Abonnements, Paiements (CI + TG)
-- À exécuter dans PHPMyAdmin (Hostinger)

SET FOREIGN_KEY_CHECKS = 0;

-- NETTOYAGE (Ordre inverse des dépendances)
DROP TABLE IF EXISTS subscription_payments;
DROP TABLE IF EXISTS payment_config;
DROP TABLE IF EXISTS plans_config;
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS shops;
DROP TABLE IF EXISTS users;

-- 1. Table des utilisateurs
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    plan VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    avatar_url TEXT,
    settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des boutiques
CREATE TABLE shops (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id CHAR(36) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    theme VARCHAR(100) DEFAULT 'default',
    logo_url TEXT,
    banner_url TEXT,
    domain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    settings JSON,
    seo_settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_shops_owner_id (owner_id),
    INDEX idx_shops_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des produits
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    category VARCHAR(100),
    tags JSON,
    shop_id CHAR(36) NOT NULL,
    inventory INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    weight DECIMAL(8,2) DEFAULT 0,
    dimensions JSON,
    images JSON,
    variants JSON,
    seo_title VARCHAR(255),
    seo_description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_products_shop_id (shop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table des clients
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSON,
    notes TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table des commandes
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    shop_id CHAR(36) NOT NULL,
    customer_id CHAR(36),
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    shipping_address JSON,
    billing_address JSON,
    notes TEXT,
    tracking_number VARCHAR(255),
    fulfilled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table des articles de commande
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id VARCHAR(255),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    product_snapshot JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table des abonnements (SaaS)
CREATE TABLE subscriptions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    stripe_subscription_id VARCHAR(255),
    current_period_start DATETIME,
    current_period_end DATETIME,
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table des paiements globaux
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36),
    subscription_id CHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    method VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSON,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table des thèmes
CREATE TABLE themes (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preview_url TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    settings_schema JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table des paramètres plateforme (Admin)
CREATE TABLE platform_settings (
    id CHAR(36) PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table des Config Plans (Admin)
CREATE TABLE plans_config (
    id CHAR(36) PRIMARY KEY,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Table des Config Paiements (Admin)
CREATE TABLE payment_config (
    id CHAR(36) PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    provider_type VARCHAR(50) DEFAULT 'mobile_money',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Table des Paiements Abonnements (Preuves)
CREATE TABLE subscription_payments (
    id CHAR(36) PRIMARY KEY,
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
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Table des Collections (Produits)
CREATE TABLE collections (
    id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_collections_shop_id (shop_id),
    INDEX idx_collections_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Table de liaison Collections-Produits
CREATE TABLE collection_products (
    collection_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, product_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- --- INSERTION DONNÉES PAR DÉFAUT ---

-- Thèmes
INSERT INTO themes (id, name, description, category, is_free) VALUES
(UUID(), 'Default', 'Thème par défaut simple et élégant', 'general', TRUE),
(UUID(), 'Fashion', 'Thème optimisé pour la mode', 'fashion', TRUE),
(UUID(), 'Electronics', 'Thème pour produits électroniques', 'electronics', TRUE),
(UUID(), 'Home & Garden', 'Thème pour maison et jardin', 'home', TRUE);

-- Paramètres
INSERT INTO platform_settings (id, `key`, value, description) VALUES
(UUID(), 'platform_name', 'Assimε', 'Nom public de la plateforme'),
(UUID(), 'support_email', 'support@assime.com', 'Email de support principal'),
(UUID(), 'free_plan_shops_limit', '2', 'Nombre de boutiques gratuites par utilisateur'),
(UUID(), 'free_plan_products_limit', '100', 'Nombre de produits max par boutique gratuite');

-- Plans
INSERT INTO plans_config (id, plan_key, name, description, price, currency, max_shops, features, is_active, display_order) VALUES
(UUID(), 'free', 'Gratuit', 'Plan gratuit avec fonctionnalités de base', 0, 'XOF', 2, '["2 boutiques", "100 produits par boutique", "Support email"]', TRUE, 1),
(UUID(), 'basic', 'Basic', '01 Mois d\'accès à Assime', 30000, 'XOF', 2, '["2 boutiques", "05 Produits gagnants offerts", "Formation vidéo complète", "Accès Ecom Mastery Gold", "01 Mois de suivi Groupe"]', TRUE, 2),
(UUID(), 'premium', 'Premium', '03 Mois d\'accès à Assime', 50000, 'XOF', 5, '["5 boutiques", "10 Produits gagnants offerts", "Formation vidéo complète", "Accès Ecom Mastery Gold", "03 Mois de suivi Groupe"]', TRUE, 3),
(UUID(), 'gold', 'Gold', '06 Mois d\'accès à Assime', 99000, 'XOF', 10, '["10 boutiques", "50 Produits gagnants offerts", "Liste de fournisseurs", "Équipe de vente Afrique", "Accès Ecom Mastery Gold", "Suivi Illimité Groupe"]', TRUE, 4);

-- Moyens de Paiement (CI + TG)
INSERT INTO payment_config (id, provider_name, phone_number, provider_type, is_active, display_order, instructions) VALUES
(UUID(), 'Orange Money', '+225 07 XX XX XX XX', 'mobile_money', TRUE, 1, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'),
(UUID(), 'MTN Mobile Money', '+225 05 XX XX XX XX', 'mobile_money', TRUE, 2, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'),
(UUID(), 'Moov Money', '+225 01 XX XX XX XX', 'mobile_money', TRUE, 3, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'),
(UUID(), 'T-Money (Togo)', '+228 9X XX XX XX', 'mobile_money', TRUE, 4, 'Effectuez le paiement et téléversez la capture d''écran de confirmation'),
(UUID(), 'Moov Money (Togo)', '+228 9X XX XX XX', 'mobile_money', TRUE, 5, 'Effectuez le paiement et téléversez la capture d''écran de confirmation');
