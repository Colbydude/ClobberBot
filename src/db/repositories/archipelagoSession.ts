import { DB, logger } from '..';
import { ArchipelagoSession } from '../models/archipelagoSession';
import { checkAllPlayersFinished } from './archipelagoSessionPlayer';

const repo = DB.getRepository(ArchipelagoSession);

/**
 *
 */
export async function createSession(
    sessionData: Pick<ArchipelagoSession, 'discord_guild_id' | 'seed' | 'started_by'>,
): Promise<ArchipelagoSession> {
    logger.info('Registering Archipelago Session...');

    try {
        await findSessionBySeed(sessionData); // throws if session not found

        throw 'Session already created for this seed!';
    } catch (error) {
        const session = repo.create(sessionData);
        await repo.save(session);

        return session;
    }
}

/**
 *
 */
export async function checkFinished(session: ArchipelagoSession): Promise<boolean> {
    if (!checkAllPlayersFinished(session)) return false;

    session.finished_at = new Date();
    await repo.save(session);

    return true;
}

/**
 *
 */
export async function findSessionBySeed(
    sessionData: Pick<ArchipelagoSession, 'discord_guild_id' | 'seed'>,
): Promise<ArchipelagoSession> {
    const session = await repo.findOne({
        where: { discord_guild_id: sessionData.discord_guild_id, seed: sessionData.seed },
    });

    if (!session)
        throw `Session could not be found for Guild ${sessionData.discord_guild_id} with Seed ${sessionData.seed}.`;

    return session;
}
