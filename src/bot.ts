import { Client, Events, GatewayIntentBits } from 'discord.js';

import logger from './logger';

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

bot.on(Events.ClientReady, () => {
    logger.info(`Logged in as ${bot.user?.tag}!`);
});

export default bot;
