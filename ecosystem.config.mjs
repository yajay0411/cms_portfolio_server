export default {
  apps: [
    {
      name: 'cms-portfolio-server',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_URI: 'mongodb://localhost:27017/cms_portfolio_dev',
        LOG_LEVEL: 'debug'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        DB_URI: 'mongodb://localhost:27017/cms_portfolio_prod',
        LOG_LEVEL: 'info'
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true
    }
  ]
}
