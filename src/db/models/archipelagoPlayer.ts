import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ArchipelagoSessionPlayer } from './archipelagoSessionPlayer';
import { ArchipelagoPlayerGame } from './archipelagoPlayerGame';

@Entity({ name: 'archipelago_players' })
export class ArchipelagoPlayer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    discord_id: string;

    @Column()
    discord_username: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany((_) => ArchipelagoPlayerGame, (playerGame) => playerGame.player, {
        createForeignKeyConstraints: false,
    })
    games: ArchipelagoPlayerGame[];

    @OneToMany((_) => ArchipelagoSessionPlayer, (sessionPlayer) => sessionPlayer.player, {
        createForeignKeyConstraints: false,
    })
    sessions: ArchipelagoSessionPlayer[];
}
