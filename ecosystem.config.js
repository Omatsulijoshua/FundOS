module.exports = {
  apps: [
    {
      name: 'fundos-backend',
      script: 'pnpm',
      args: '--filter backend-api run start:prod',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'fundos-trader-dashboard',
      script: 'pnpm',
      args: '--filter trader-dashboard run start -- -p 3000',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'fundos-admin-dashboard',
      script: 'pnpm',
      args: '--filter admin-dashboard run start -- -p 3002',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
