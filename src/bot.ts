import { Client, Events, GatewayIntentBits } from 'discord.js';

import { createScopedLogger } from './logger';

const logger = createScopedLogger('Discord');

export const bot = new Client({
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
