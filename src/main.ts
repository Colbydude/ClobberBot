import * as dotenv from 'dotenv';
dotenv.config();

import { GatewayDispatchEvents } from 'discord.js';
import path from 'path';
import { GatewayServer, SlashCreator } from 'slash-create';

import bot from './bot';
import logger from 'logger';

// Register commands.
const creator = new SlashCreator({
    client: bot,

    applicationID: process.env.DISCORD_CLIENT_ID,
    publicKey: process.env.DISCORD_CLIENT_PUBKEY,
    token: process.env.DISCORD_CLIENT_TOKEN,
});

creator
    .withServer(
        new GatewayServer((handler) => bot.ws.on(GatewayDispatchEvents.IntegrationCreate, handler))
    )
    .registerCommandsIn(path.join(__dirname, './commands'))
    .syncCommands();

logger.info(`Loaded ${creator.commands.size} command handlers.`);

// Connect the bot.
bot.login(process.env.DISCORD_CLIENT_TOKEN);
