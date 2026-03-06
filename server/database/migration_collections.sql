-- ============================================
-- Migration: Collections
-- Permet de regrouper les produits dans des collections (ex: Été, Promotions, Nouveautés)
-- ============================================

-- Table des collections
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, slug)
);

-- Table de liaison collection <-> produits (many-to-many)
CREATE TABLE IF NOT EXISTS collection_products (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (collection_id, product_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_collections_shop_id ON collections(shop_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);
