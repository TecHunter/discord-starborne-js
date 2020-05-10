module.exports = {
  apps : [{
    script: 'bot.js',
    watch: '.',
    // cwd: 'D:\\_projects\\starborne-js\\discord',
    // interpreter: '.\\node_modules\\@babel\\node\\bin\\babel-node.js'
    interpreter: './node_modules/.bin/babel-node'
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'git@github.com:TecHunter/discord-starborne-js.git',
      path : '/opt/discord-starborne-bot',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
