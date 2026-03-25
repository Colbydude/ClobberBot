import { Client, NetworkSlot } from 'archipelago.js';
import { TextChannel } from 'discord.js';

import { bot } from './bot';
import { checkFinished, findSessionBySeed } from './db/repositories/archipelagoSession';
import {
    findSessionPlayersBySlot,
    finish,
    release,
} from './db/repositories/archipelagoSessionPlayer';
import { createScopedLogger } from './logger';

const logger = createScopedLogger('Archipelago');

export const activeClients: { guild: string; channel: string; client: Client }[] = [];

/**
 * Connect the bot to the Archipelago server.
 */
export async function connect(
    guildId: string,
    channelId: string,
    server: string,
    hostSlot: string,
): Promise<Client> {
    const existingClient = activeClients.find((entry) => entry.guild == guildId);

    if (existingClient != null) {
        return existingClient.client;
    }

    const client = new Client();

    client.socket.on('connected', () => {
        logger.info(`Connected.`);

        activeClients.push({ guild: guildId, channel: channelId, client });
    });

    client.socket.on('disconnected', async () => {
        logger.warn('Disconnected from the Archipelago Server.');

        try {
            const guild = await bot.guilds.fetch(guildId);
            const channel = (await guild.channels.fetch(channelId)) as TextChannel;

            await channel.send(`💥 | ClobberBot Archipelago client disconnected from server.`);
        } catch (error) {
            logger.error(error);
        } finally {
            removeClient(guildId);
        }
    });

    client.messages.on('goaled', async (_, player) => {
        try {
            const guild = await bot.guilds.fetch(guildId);
            const channel = (await guild.channels.fetch(channelId)) as TextChannel;

            const session = await findSessionBySeed({
                discord_guild_id: guildId,
                seed: client.room.seedName,
            });
            const players = await findSessionPlayersBySlot(session.id, player.alias);

            const dbPromises = players.map((player) => {
                return finish(player);
            });
            const discordPromises = players.map((player) => {
                return channel.send(`🎉 | ${player.slot} has finished ${player.game.name}!`);
            });

            await Promise.all([...dbPromises, ...discordPromises]);

            if (await checkFinished(session)) {
                await channel.send(`🏁 | Archipelago finished!`);
            }
        } catch (error) {
            logger.error(error);
        }
    });

    client.messages.on('released', async (_, player) => {
        try {
            const guild = await bot.guilds.fetch(guildId);
            const channel = (await guild.channels.fetch(channelId)) as TextChannel;

            const session = await findSessionBySeed({
                discord_guild_id: guildId,
                seed: client.room.seedName,
            });
            const players = await findSessionPlayersBySlot(session.id, player.alias);

            const dbPromises = players.map((player) => {
                return release(player);
            });
            const discordPromises = players.map((player) => {
                return channel.send(`💢 | ${player.slot} has released ${player.game.name}.`);
            });

            await Promise.all([...dbPromises, ...discordPromises]);

            if (await checkFinished(session)) {
                await channel.send(`🏁 | Archipelago finished!`);
            }
        } catch (error) {
            logger.error(error);
        }
    });

    try {
        logger.info(`Connecting to server at ${server} under slot ${hostSlot}...`);
        await client.login(server, hostSlot);

        return client;
    } catch (error) {
        logger.error(`Error connecting to server. ${error}`);
        throw error;
    }
}

export function findPlayerBySlotName(client: Client, alias: string): NetworkSlot {
    const slots = client.players.slots;

    for (const slot of Object.values(slots)) {
        if (slot.name === alias) return slot;
    }

    throw `Could not find the slot ${alias}!`;
}

/**
 * Remove client from the list of active clients.
 */
function removeClient(guildId: string): void {
    const index = activeClients.findIndex((entry) => entry.guild === guildId);

    if (index !== -1) {
        activeClients.splice(index, 1);
    }
}
