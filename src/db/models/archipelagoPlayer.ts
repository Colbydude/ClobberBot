import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'archipelago_players' })
export class ArchipelagoPlayer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    discord_id: string;

    @Column()
    discord_username: string;

    @Column('json')
    games: {
        name: string;
        completions: number;
        releases: number;
    }[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
