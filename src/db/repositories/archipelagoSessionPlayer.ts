import { DB, logger } from '..';
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
