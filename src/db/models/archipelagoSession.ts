import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ArchipelagoSessionPlayer } from '../../types';

@Entity({ name: 'archipelago_sessions' })
export class ArchipelagoSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    discord_guild_id: string;

    @Column()
    started_by: string;

    @Column()
    seed: string;

    @Column('json')
    players: ArchipelagoSessionPlayer[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column('datetime', { nullable: true })
    finished_at: Date;
}
