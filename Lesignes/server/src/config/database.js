const { Pool } = require('pg')

const poolConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Nécessaire pour Supabase/Render/Vercel
  }
  : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'lesigne_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }

const pool = new Pool(poolConfig)

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connexion à la base de données établie')
})

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}
