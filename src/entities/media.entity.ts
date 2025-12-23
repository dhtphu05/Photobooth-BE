import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Session } from './session.entity';

@Entity()
export class Media {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column({
        type: 'enum',
        enum: ['ORIGINAL', 'PROCESSED', 'VIDEO'],
        default: 'ORIGINAL',
    })
    type: 'ORIGINAL' | 'PROCESSED' | 'VIDEO';

    @ManyToOne(() => Session, (session) => session.medias, { onDelete: 'CASCADE' })
    session: Session;
}
