import { ShardingManager } from 'discord.js-light';
import { Manager } from './manager';
import { Config } from './models/config';
import { InternalLanguage } from './models/internal-language';
import { HttpService } from './services/http-service';
import { Logger } from './services/logger';
import { BotsOnDiscordXyzSite } from './services/sites/bots-on-discord-xyz-site';
import { DiscordBotListComSite } from './services/sites/discord-bot-list-com-site';
import { DiscordBotsGgSite } from './services/sites/discord-bots-gg-site';
import { TopGgSite } from './services/sites/top-gg-site';
import { ShardUtils } from './utils/shard-utils';

let config: Config = require('../config/config.json');
let internalLang: InternalLanguage = require('../lang/internal.en.json');

async function start(): Promise<void> {
    // Dependency Injection
    let logger = new Logger(internalLang.tags);
    let httpService = new HttpService();
    let topGgSite = new TopGgSite(config.botSites.topGg, httpService);
    let botsOnDiscordXyzSite = new BotsOnDiscordXyzSite(
        config.botSites.botsOnDiscordXyz,
        httpService
    );
    let discordBotsGgSite = new DiscordBotsGgSite(config.botSites.discordBotsGg, httpService);
    let discordBotListComSite = new DiscordBotListComSite(
        config.botSites.discordBotListCom,
        httpService
    );

    logger.info(`${internalLang.tags.manager} ${internalLang.logs.appStarted}`);

    let totalShards = 0;
    try {
        totalShards = await ShardUtils.getRecommendedShards(
            config.client.token,
            config.sharding.serversPerShard
        );
    } catch (error) {
        logger.error(`${internalLang.tags.manager} ${internalLang.logs.shardCountError}`, error);
        return;
    }

    let myShardIds = ShardUtils.getMyShardIds(
        totalShards,
        config.sharding.machineId,
        config.sharding.machineCount
    );

    if (myShardIds.length === 0) {
        logger.warn(`${internalLang.tags.manager} ${internalLang.logs.noShards}`);
        return;
    }

    let shardManager = new ShardingManager('dist/start.js', {
        token: config.client.token,
        mode: 'worker',
        respawn: true,
        totalShards,
        shardList: myShardIds,
    });

    let manager = new Manager(
        shardManager,
        [topGgSite, botsOnDiscordXyzSite, discordBotsGgSite, discordBotListComSite],
        logger,
        internalLang.tags.manager,
        internalLang.logs
    );
    await manager.start();
    setInterval(() => {
        manager.updateServerCount();
    }, config.updateInterval * 1000);
}

start();
