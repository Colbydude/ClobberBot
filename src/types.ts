export interface ArchipelagoSessionPlayer {
    discord_user: string;
    slot: string;
    game: string;
    status: 'joined' | 'released' | 'finished';
}
