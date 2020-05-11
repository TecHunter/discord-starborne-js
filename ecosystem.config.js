module.exports = {
  apps : [{
    script: 'dist/bot.js'
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'git@github.com:TecHunter/discord-starborne-js.git',
      path : '/opt/discord-starborne-bot',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
