module.exports = {
  apps: [
    {
      name: 'kroko-server',
      script: 'npm run start:prod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      kill_timeout: 4000,
      env: {
        PRODUCTION: true,
        NODE_ENV: 'production',
        PORT: 6013,
      },
    }
  ]
}