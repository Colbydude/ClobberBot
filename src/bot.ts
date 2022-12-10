import { Client, GatewayIntentBits } from 'discord.js';

import logger from './logger';

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

bot.on('ready', () => {
    logger.info(`Logged in as ${bot.user?.tag}!`);
});

export default bot;
