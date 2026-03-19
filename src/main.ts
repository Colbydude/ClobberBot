import { GatewayDispatchEvents } from 'discord.js';
import path from 'path';
import { GatewayServer, SlashCreator } from 'slash-create';

import bot from './bot';
import logger from './logger';

(async () => {
    // Register commands.
    const creator = new SlashCreator({
        client: bot,

        applicationID: process.env.DISCORD_CLIENT_ID,
        publicKey: process.env.DISCORD_CLIENT_PUBKEY,
        token: process.env.DISCORD_CLIENT_TOKEN,
    }).withServer(
        new GatewayServer((handler) => bot.ws.on(GatewayDispatchEvents.InteractionCreate, handler)),
    );

    await creator.registerCommandsIn(path.join(__dirname, './commands'));
    await creator.syncCommands();

    logger.info(`Loaded ${creator.commands.size} command handlers.`);

    // Connect the bot.
    bot.login(process.env.DISCORD_CLIENT_TOKEN);
})();
