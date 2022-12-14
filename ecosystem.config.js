module.exports = {
  apps: [
    {
      name: "uploader",
      script: "server.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: "ubuntu",
      host: "3.36.113.189",
      ref: "origin/main",
      // repo: "git@github.com:aslamjon/preview.git",
      repo: "https://github.com/aslamjon/uploader.git",
      path: "/home/ubuntu/uploader",
      "pre-setup": "pwd",
      "pre-deploy-local": "echo 'This is a local deployment'",
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
