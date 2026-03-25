import { DB, logger } from '..';
import { ArchipelagoPlayerGame } from '../models/archipelagoPlayerGame';

const repo = DB.getRepository(ArchipelagoPlayerGame);

/**
 *
 */
export async function findOrCreateGameForPlayer(
    gameData: Pick<ArchipelagoPlayerGame, 'player' | 'name'>,
): Promise<ArchipelagoPlayerGame> {
    let game = await repo.findOne({
        where: {
            name: gameData.name,
            player: { id: gameData.player.id },
        },
        relations: ['player'],
    });

    if (!game) {
        logger.info(
            `Registering new game ${gameData.name} for player ${gameData.player.discord_username}.`,
        );
        game = repo.create({ ...gameData, completions: 0, releases: 0 });
        await repo.save(game);
    }

    return game;
}
