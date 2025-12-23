import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session } from '../entities/session.entity';
import { Media } from '../entities/media.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Session, Media])],
    controllers: [SessionsController],
    providers: [SessionsService],
    exports: [SessionsService],
})
export class SessionsModule { }
