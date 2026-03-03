// PM2 Ecosystem Config — McClean
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'mcclean',
      script: 'server.js',
      instances: 'max',        // Use all CPU cores
      exec_mode: 'cluster',    // Cluster mode for load balancing
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        ADMIN_PASSWORD: 'CHANGE_THIS_TO_A_SECURE_PASSWORD'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
    }
  ]
};
