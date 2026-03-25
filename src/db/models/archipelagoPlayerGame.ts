import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ArchipelagoPlayer } from './archipelagoPlayer';

@Entity({ name: 'archipelago_player_games' })
export class ArchipelagoPlayerGame {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((_) => ArchipelagoPlayer, (player) => player.games, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'player_id' })
    player: ArchipelagoPlayer;

    @Column()
    name: string;

    @Column()
    completions: number;

    @Column()
    releases: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
