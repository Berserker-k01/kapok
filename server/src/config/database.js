const mysql = require('mysql2/promise')

// Fonction pour parser DATABASE_URL
const parseDatabaseUrl = (url) => {
  if (!url) return null

  // Format: mysql://user:password@host:port/database
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) return null

  return {
    host: match[3],
    user: match[1],
    password: match[2],
    database: match[5],
    port: parseInt(match[4]),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00'
  }
}

// --- CONFIGURATION HYBRIDE (DOCKER / HOSTINGER) ---
const poolConfig = {
  // CONFIGURATION HARDCODÉE (Mode Hostinger)
  // Plus de dépendance à process.env
  host: '127.0.0.1',
  user: 'u980915146_admin',
  password: 'Daniel2005k@ssi',
  database: 'u980915146_assimedb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

const pool = mysql.createPool(poolConfig)

// Test de connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion à la base de données MySQL établie')
    connection.release()
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données MySQL:', err)
  })

// Fonction pour convertir les placeholders PostgreSQL ($1, $2, ...) en MySQL (?)
const convertPlaceholders = (sql, params) => {
  if (!params || params.length === 0) return { sql, params: [] }

  // Extraire tous les placeholders $1, $2, etc.
  const placeholderRegex = /\$(\d+)/g
  const matches = [...sql.matchAll(placeholderRegex)]

  if (matches.length === 0) {
    // Pas de placeholders, retourner tel quel
    return { sql, params: params || [] }
  }

  // Trouver le placeholder maximum
  const placeholders = matches.map(m => parseInt(m[1]))
  const maxPlaceholder = Math.max(...placeholders)

  if (params.length < maxPlaceholder) {
    throw new Error(`Pas assez de paramètres fournis. Placeholder max: ${maxPlaceholder}, paramètres: ${params.length}`)
  }

  // Remplacer tous les $N par ?
  let convertedSql = sql.replace(/\$\d+/g, '?')

  // Réorganiser les paramètres dans l'ordre d'apparition
  const orderedParams = matches.map(m => params[parseInt(m[1]) - 1])

  return { sql: convertedSql, params: orderedParams }
}

// Fonction query compatible avec PostgreSQL
// PostgreSQL retourne { rows, rowCount }, MySQL retourne [rows, fields]
// PostgreSQL utilise $1, $2... pour les paramètres, MySQL utilise ?
// On normalise pour que le code existant fonctionne sans modification
const query = async (text, params) => {
  try {
    let finalSql = text
    let finalParams = params || []
    let needsReturning = false
    let returnTable = null

    // Gérer RETURNING (PostgreSQL spécifique)
    if (text.includes(' RETURNING ')) {
      needsReturning = true
      const tableMatch = text.match(/INSERT INTO (\w+)/i)
      if (tableMatch) {
        returnTable = tableMatch[1]
      }
      // Retirer RETURNING de la requête
      finalSql = text.replace(/RETURNING .+$/i, '').trim()
    }

    // Convertir les placeholders PostgreSQL ($1, $2...) en MySQL (?)
    const { sql, params: convertedParams } = convertPlaceholders(finalSql, finalParams)

    // Exécuter la requête
    const [result, fields] = await pool.execute(sql, convertedParams)

    let rows = [];
    let rowCount = 0;
    let rowsAffected = 0;
    let insertId = null;

    // Détecter si c'est un ResultSetHeader (INSERT/UPDATE) ou un tableau (SELECT)
    if (result && !Array.isArray(result)) {
      // C'est un INSERT/UPDATE/DELETE
      rowsAffected = result.affectedRows || 0;
      insertId = result.insertId || null;
      rowCount = 0;
    } else {
      // C'est un SELECT
      rows = result;
      rowCount = result.length;
      rowsAffected = 0; // standard postgres behavior for select
    }

    // Si c'était un INSERT avec RETURNING artificiel
    if (needsReturning && returnTable && insertId) {
      const [returnedRows] = await pool.execute(`SELECT * FROM ${returnTable} WHERE id = ?`, [insertId])
      return {
        rows: returnedRows,
        rowCount: returnedRows.length,
        rowsAffected: rowsAffected
      }
    }

    // Retourner au format PostgreSQL pour compatibilité
    return {
      rows: rows,
      rowCount: rowCount,
      rowsAffected: rowsAffected || rowCount
    }
  } catch (error) {
    throw error
  }
}

module.exports = {
  query,
  pool
}
