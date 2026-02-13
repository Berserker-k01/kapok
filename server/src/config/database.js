const { Pool } = require('pg')
require('dotenv').config()

// --- CONFIGURATION PostgreSQL ---
// Priorité: DATABASE_URL > PGHOST/PGUSER/... > valeurs par défaut Docker
let poolConfig

if (process.env.DATABASE_URL) {
  // Mode DATABASE_URL (Render, Heroku, Supabase, etc.)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  }
  // SSL si nécessaire
  if (process.env.DB_SSL !== 'false') {
    poolConfig.ssl = { rejectUnauthorized: false }
  }
  console.log('📦 PostgreSQL: Connexion via DATABASE_URL')
} else {
  // Mode variables individuelles (Docker Compose / local)
  poolConfig = {
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432'),
    database: process.env.PGDATABASE || process.env.DB_NAME || 'assime_db',
    user: process.env.PGUSER || process.env.DB_USER || 'assime_user',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'assime_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  }
  console.log(`📦 PostgreSQL: Connexion vers ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`)
}

const pool = new Pool(poolConfig)

// Test de connexion
pool.connect()
  .then(client => {
    console.log('✅ Connexion à la base de données PostgreSQL établie')
    client.release()
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données PostgreSQL:', err.message)
  })

/**
 * Convertit les placeholders MySQL (?) en placeholders PostgreSQL ($1, $2, ...)
 * Cela permet de garder le code des services/routes inchangé.
 */
const convertPlaceholders = (sql) => {
  let counter = 0
  return sql.replace(/\?/g, () => `$${++counter}`)
}

/**
 * Fonction query compatible — retourne { rows, rowCount, rowsAffected }
 * Gère la conversion automatique des placeholders ? → $N
 */
const query = async (text, params) => {
  try {
    // Transactions: BEGIN, COMMIT, ROLLBACK n'ont pas de placeholders
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(text.trim().toUpperCase())) {
      await pool.query(text)
      return { rows: [], rowCount: 0, rowsAffected: 0 }
    }

    // Convertir les placeholders ? → $N
    const pgSql = convertPlaceholders(text)

    const result = await pool.query(pgSql, params || [])

    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
      rowsAffected: result.rowCount || 0
    }
  } catch (error) {
    console.error('[DB Error] Query:', text.substring(0, 120))
    console.error('[DB Error] Message:', error.message)
    throw error
  }
}

module.exports = {
  query,
  pool
}
