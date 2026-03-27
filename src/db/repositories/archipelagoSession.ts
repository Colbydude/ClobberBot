import { DB, logger } from '..';
import { ArchipelagoSession } from '../models/archipelagoSession';

const repo = DB.getRepository(ArchipelagoSession);

/**
 * Creates the Archipielago session.
 * @throws If there is an existing session for the given seed.
 */
export async function createSession(
    sessionData: Pick<ArchipelagoSession, 'discord_guild_id' | 'seed' | 'started_by'>,
): Promise<ArchipelagoSession> {
    logger.info('Registering Archipelago Session...');

    try {
        await findSessionBySeed(sessionData);

        throw 'Session already created for this seed!';
    } catch (error) {
        const session = repo.create(sessionData);
        await repo.save(session);

        return session;
    }
}

/**
 * Finds the Archipelago session by the given seed/Discord Guild.
 * @throws If a session cannot be found.
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
