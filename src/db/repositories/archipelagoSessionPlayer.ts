import { In, IsNull } from 'typeorm';

import { DB } from '..';
import { ArchipelagoPlayerGame } from '../models/archipelagoPlayerGame';
import { ArchipelagoSession } from '../models/archipelagoSession';
import { ArchipelagoSessionPlayer } from '../models/archipelagoSessionPlayer';

const repo = DB.getRepository(ArchipelagoSessionPlayer);

/**
 * Adds the given player to the given session.
 * @throws If the player has already joined under the same or a different slot.
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
 * Finds all session players by the given slot name.
 * @throws If the session player cannot be found.
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
 * Update all relevant columns when a player goals or releases,
 * then checks if all players for a session have finished.
 * @returns Whether or not every player has finished.
 */
export async function finishPlayers(
    sessionId: string,
    sessionPlayers: ArchipelagoSessionPlayer[],
    update: 'finished' | 'released',
) {
    return await DB.transaction(async (manager) => {
        const sessionRepo = manager.getRepository(ArchipelagoSession);
        const sessionPlayerRepo = manager.getRepository(ArchipelagoSessionPlayer);
        const gameRepo = manager.getRepository(ArchipelagoPlayerGame);

        // Mark players as finished/released.
        await sessionPlayerRepo.update(
            { id: In(sessionPlayers.map((p) => p.id)) },
            { status: update, finished_at: new Date() },
        );

        // Update game counts.
        const gameIds = Array.from(new Set(sessionPlayers.map((p) => p.game.id)));
        const column = update === 'finished' ? 'completions' : 'releases';

        await gameRepo.update({ id: In(gameIds) }, { [column]: () => `${column} + 1` });

        // Check if any players are unfinished.
        const remaining = await sessionPlayerRepo.countBy({
            session: { id: sessionId },
            finished_at: IsNull(),
        });

        if (remaining > 0) return false;

        // Mark session finished.
        const result = await sessionRepo.update(
            { id: sessionId, finished_at: IsNull() },
            { finished_at: new Date() },
        );

        return (result.affected ?? 0) > 0;
    });
}
