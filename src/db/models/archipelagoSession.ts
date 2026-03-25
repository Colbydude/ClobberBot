import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ArchipelagoSessionPlayer } from './archipelagoSessionPlayer';
import { ArchipelagoPlayer } from './archipelagoPlayer';

@Entity({ name: 'archipelago_sessions' })
export class ArchipelagoSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    discord_guild_id: string;

    @ManyToOne((_) => ArchipelagoPlayer, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'started_by' })
    started_by: ArchipelagoPlayer;

    @Column()
    seed: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column('datetime', { nullable: true })
    finished_at: Date;

    @OneToMany((_) => ArchipelagoSessionPlayer, (player) => player.session, {
        createForeignKeyConstraints: false,
    })
    players: ArchipelagoSessionPlayer;
}
