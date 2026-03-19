import { DB, logger } from '..';
import { ArchipelagoSession } from '../models/archipelagoSession';
import { ArchipelagoSessionPlayer } from '../../types';

const sessionRepo = DB.getRepository(ArchipelagoSession);

/**
 *
 */
export async function createSession(
    guildId: string,
    seed: string,
    player: ArchipelagoSessionPlayer,
): Promise<ArchipelagoSession> {
    logger.info('Registering Archipelago Session...');

    await sessionRepo.insert({
        discord_guild_id: guildId,
        players: [player],
        seed,
        started_by: player.discord_user,
    });

    var newSession = await sessionRepo.findOneByOrFail({
        discord_guild_id: guildId,
        seed,
    });

    return newSession;
}
