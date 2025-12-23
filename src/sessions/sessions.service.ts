import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Media } from '../entities/media.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Session)
        private sessionsRepository: Repository<Session>,
        @InjectRepository(Media)
        private mediaRepository: Repository<Media>,
    ) { }

    async create(createSessionDto: CreateSessionDto): Promise<Session> {
        const session = this.sessionsRepository.create(createSessionDto);
        return this.sessionsRepository.save(session);
    }

    async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
        const session = await this.sessionsRepository.findOneBy({ id });
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        Object.assign(session, updateSessionDto);
        return this.sessionsRepository.save(session);
    }

    async complete(id: string): Promise<Session> {
        return this.update(id, { status: 'COMPLETED' });
    }

    async addMedia(sessionId: string, fileUrl: string, type: 'ORIGINAL' | 'PROCESSED' | 'VIDEO' = 'ORIGINAL'): Promise<Media> {
        const session = await this.sessionsRepository.findOneBy({ id: sessionId });
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        const media = this.mediaRepository.create({
            url: fileUrl,
            type,
            session,
        });
        return this.mediaRepository.save(media);
    }

    async findOne(id: string): Promise<Session> {
        const session = await this.sessionsRepository.findOne({
            where: { id },
            relations: ['medias']
        });
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        return session;
    }
}
