import { DB, logger } from '..';
import { ArchipelagoPlayer } from '../models/archipelagoPlayer';

const repo = DB.getRepository(ArchipelagoPlayer);

/**
 * Finds or creates the player by their Discord identity.
 */
export async function findOrCreatePlayer(
    playerData: Pick<ArchipelagoPlayer, 'discord_id' | 'discord_username'>,
): Promise<ArchipelagoPlayer> {
    let player = await repo.findOne({ where: { discord_id: playerData.discord_id } });

    if (!player) {
        logger.info(`Registering new Archipelago Player ${playerData.discord_username}.`);
        player = repo.create(playerData);
        await repo.save(player);
    }

    return player;
}
