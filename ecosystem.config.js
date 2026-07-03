module.exports = {
  apps: [
    {
      name: 'psikotakip-api',
      script: 'node',
      args: 'apps/api/dist/apps/api/src/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '172.16.0.70',
      },
    },
    {
      name: 'psikotakip-frontend',
      script: 'node',
      args: 'node_modules/next/dist/bin/next start -p 9002 -H 172.16.0.70',
      env: {
        NODE_ENV: 'production',
        // The default per-session TEMP dir (…\Temp\2) can be cleaned up under
        // pm2, which breaks next.config.ts loading. Pin TEMP/TMP to a stable dir.
        TEMP: 'C:\\Users\\Administrator\\AppData\\Local\\Temp',
        TMP: 'C:\\Users\\Administrator\\AppData\\Local\\Temp',
      },
    },
  ],
};



