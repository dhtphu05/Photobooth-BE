import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ['INIT', 'SELECTING', 'COUNTDOWN', 'CAPTURING', 'COMPLETED'],
        default: 'INIT',
    })
    status: 'INIT' | 'SELECTING' | 'COUNTDOWN' | 'CAPTURING' | 'COMPLETED';

    @Column({ nullable: true })
    selectedFilter: string;

    @Column({ nullable: true })
    selectedFrame: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Media, (media) => media.session, { cascade: true })
    medias: Media[];
}
