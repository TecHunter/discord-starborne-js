
// Include discord.js ShardingManger
require('dotenv').config();
import logger from "winston";
const { ShardingManager } = require('discord.js');
let token = null;
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'info';
if (process.env.TOKEN_DEV) {
    logger.info('Using DEV token');
    token = process.env.TOKEN_DEV;
} else if (process.env.TOKEN_PROD) {
    logger.info('Using PROD token');
    token = process.env.TOKEN_PROD;
} else {
    logger.error('Missing token');
    process.exit(-1);
}
// Create your ShardingManger instance
const manager = new ShardingManager('dist/bot.js', {
    // for ShardingManager options see:
    // https://discord.js.org/#/docs/main/v11/class/ShardingManager

    // 'auto' handles shard count automatically
    totalShards: 'auto',

    // your bot token
    token,
    autoSpawn: true
});

// Spawn your shards
manager.spawn(2);

manager.on('shardCreate', shard => logger.info(`[SHARD] Shard ${shard.id}/${manager.totalShards}`));
