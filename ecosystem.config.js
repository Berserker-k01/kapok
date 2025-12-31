module.exports = {
  apps: [
    {
      name: 'lesigne-server',
      script: './server/src/index.js',
      cwd: './Lesignes',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'lesigne-user-panel',
      script: 'serve',
      args: '-s dist -l 3001',
      cwd: './Lesignes/user-panel',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '../logs/user-panel-error.log',
      out_file: '../logs/user-panel-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false
    },
    {
      name: 'lesigne-admin-panel',
      script: 'serve',
      args: '-s dist -l 3002',
      cwd: './Lesignes/admin-panel',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '../logs/admin-panel-error.log',
      out_file: '../logs/admin-panel-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false
    }
  ]
}

