import { Client, NetworkSlot } from 'archipelago.js';

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

    client.socket.on('disconnected', () => {
        logger.warn('Disconnected from the Archipelago Server.');
        // @TODO: Push message to Discord channel.

        removeClient(guildId);
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
