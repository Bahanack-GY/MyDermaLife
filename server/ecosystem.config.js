module.exports = {
  apps: [
    {
      name: 'mydermalife-api',
      script: 'dist/main.js',
      cwd: '/var/www/mydermalife/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 7070,
      },
    },
  ],
};
