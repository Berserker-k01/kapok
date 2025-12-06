const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lesigne_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

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
