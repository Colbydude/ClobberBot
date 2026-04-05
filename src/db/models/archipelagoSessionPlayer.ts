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
import { ArchipelagoPlayerGame } from './archipelagoPlayerGame';
import { ArchipelagoSession } from './archipelagoSession';

@Entity({ name: 'archipelago_session_players' })
export class ArchipelagoSessionPlayer {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((_) => ArchipelagoSession, (session) => session.players, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'session_id' })
    session: ArchipelagoSession;

    @ManyToOne((_) => ArchipelagoPlayer, (player) => player.sessions, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'player_id' })
    player: ArchipelagoPlayer;

    @ManyToOne((_) => ArchipelagoPlayerGame, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'game_id' })
    game: ArchipelagoPlayerGame;

    @Column()
    slot: string;

    @Column()
    status: 'joined' | 'released' | 'finished';

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column('datetime', { nullable: true })
    finished_at: Date | null;
}
