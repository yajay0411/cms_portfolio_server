module.exports = {
  apps: [
    {
      name: 'cms-portfolio-server',
      script: './dist/server.js', // Compiled JS entry
      instances: 'max',
      exec_mode: 'cluster',
      watch: true,
      env_development: {
        NODE_ENV: 'development',
        PORT: 8080,
        DB_URI: 'mongodb+srv://yajay04112000:7lw3n41VfbrNe6Px@cms-portfolio.oasqa.mongodb.net/cms-portfolio?retryWrites=true&w=majority',
        LOG_LEVEL: 'debug'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 9090,
        DB_URI: 'mongodb+srv://yajay04112000:7lw3n41VfbrNe6Px@cms-portfolio.oasqa.mongodb.net/cms-portfolio?retryWrites=true&w=majority',
        LOG_LEVEL: 'info'
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      time: true
    }
  ]
};
