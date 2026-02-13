module.exports = {
  apps: [
    {
      name: 'lesigne-server',
      script: './server/src/index.js',
      // cwd sera le dossier d'exécution courant (public_html/)
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './server/logs/server-error.log',
      out_file: './server/logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
}

