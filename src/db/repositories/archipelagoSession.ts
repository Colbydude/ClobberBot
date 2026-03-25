import { DB, logger } from '..';
import { ArchipelagoSession } from '../models/archipelagoSession';

const repo = DB.getRepository(ArchipelagoSession);

/**
 *
 */
export async function createSession(
    sessionData: Pick<ArchipelagoSession, 'discord_guild_id' | 'seed' | 'started_by'>,
): Promise<ArchipelagoSession> {
    logger.info('Registering Archipelago Session...');

    let session = await repo.findOne({
        where: { discord_guild_id: sessionData.discord_guild_id, seed: sessionData.seed },
    });

    if (session) throw 'Session already created for this seed!';

    session = repo.create(sessionData);
    await repo.save(session);

    return session;
}
