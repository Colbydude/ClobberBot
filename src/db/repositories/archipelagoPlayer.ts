import { DB, logger } from '..';
import { ArchipelagoPlayer } from '../models/archipelagoPlayer';

const repo = DB.getRepository(ArchipelagoPlayer);

export interface ArchipelagoPlayerLeaderboardEntry {
    id: number;
    discord_username: string;
    total_completions: number;
    total_releases: number;
    score: number;
}

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

/**
 * Get the players ordered by their total completions - total releases.
 */
export async function getPlayerLeaderboard(): Promise<ArchipelagoPlayerLeaderboardEntry[]> {
    const leaderboard = await repo
        .createQueryBuilder('player')
        .leftJoin('player.games', 'game')
        .select('player.id', 'id')
        .addSelect('player.discord_username', 'discord_username')
        .addSelect('COALESCE(SUM(game.completions), 0)', 'total_completions')
        .addSelect('COALESCE(SUM(game.releases), 0)', 'total_releases')
        .addSelect('COALESCE(SUM(game.completions), 0) - COALESCE(SUM(game.releases), 0)', 'score')
        .groupBy('player.id')
        .addGroupBy('player.discord_username')
        .orderBy('score', 'DESC')
        .limit(10)
        .getRawMany<ArchipelagoPlayerLeaderboardEntry>();

    return leaderboard;
}
