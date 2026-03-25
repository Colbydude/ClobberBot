import { ArchipelagoSession } from 'db/models/archipelagoSession';
import { DB } from '..';
import { ArchipelagoPlayerGame } from '../models/archipelagoPlayerGame';
import { ArchipelagoSessionPlayer } from '../models/archipelagoSessionPlayer';

const repo = DB.getRepository(ArchipelagoSessionPlayer);

/**
 *
 */
export async function addSessionPlayer(
    sessionPlayerData: Pick<ArchipelagoSessionPlayer, 'session' | 'player' | 'game' | 'slot'>,
): Promise<ArchipelagoSessionPlayer> {
    let sessionPlayer = await repo.findOne({
        where: {
            session: { id: sessionPlayerData.session.id },
            player: { id: sessionPlayerData.player.id },
        },
        relations: ['session', 'player', 'game'],
    });

    if (sessionPlayer)
        throw `Player ${sessionPlayer.player.discord_username} has already joined under slot ${sessionPlayerData.slot}!`;

    sessionPlayer = repo.create({ ...sessionPlayerData, status: 'joined' });
    await repo.save(sessionPlayer);

    return sessionPlayer;
}

/**
 *
 */
export async function checkAllPlayersFinished(session: ArchipelagoSession): Promise<boolean> {
    const unfinishedCount = await repo
        .createQueryBuilder('player')
        .where('player.session_id = :sessionId', { sessionId: session.id })
        .andWhere('player.finished_at IS NULL')
        .getCount();

    return unfinishedCount === 0;
}

/**
 *
 */
export async function findSessionPlayersBySlot(
    sessionId: string,
    slot: string,
): Promise<ArchipelagoSessionPlayer[]> {
    const sessionPlayer = await repo.find({
        where: {
            session: { id: sessionId },
            slot,
        },
        relations: ['game', 'player'],
    });

    if (!sessionPlayer) throw `Slot ${slot} could not be found for session ${sessionId}`;

    return sessionPlayer;
}

/**
 *
 */
export async function finish(player: ArchipelagoSessionPlayer): Promise<void> {
    await DB.transaction(async (manager) => {
        const sessionPlayerRepo = manager.getRepository(ArchipelagoSessionPlayer);
        const gameRepo = manager.getRepository(ArchipelagoPlayerGame);

        player.status = 'finished';
        player.finished_at = new Date();
        player.game.completions++;

        await sessionPlayerRepo.save(player);
        await gameRepo.save(player.game);
    });
}

/**
 *
 */
export async function release(player: ArchipelagoSessionPlayer): Promise<void> {
    await DB.transaction(async (manager) => {
        const sessionPlayerRepo = manager.getRepository(ArchipelagoSessionPlayer);
        const gameRepo = manager.getRepository(ArchipelagoPlayerGame);

        player.status = 'released';
        player.finished_at = new Date();
        player.game.releases++;

        await sessionPlayerRepo.save(player);
        await gameRepo.save(player.game);
    });
}
