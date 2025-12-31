/**
 * Configuration PM2 pour gérer les processus Node.js
 * Installation: npm install -g pm2
 * Démarrage: pm2 start ecosystem.config.js
 * Status: pm2 status
 * Logs: pm2 logs
 * Arrêt: pm2 stop all
 */

module.exports = {
  apps: [
    {
      name: 'lesigne-api',
      script: './src/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
}

