import { Controller, Post, Body, Patch, Param, UseInterceptors, UploadedFile, BadRequestException, Query, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Session } from '../entities/session.entity';
import { Media } from '../entities/media.entity';
import { StorageService } from '../storage/storage.service';

import { VideoService } from './video.service';

@ApiTags('Sessions')
@Controller('api/sessions')
export class SessionsController {
    constructor(
        private readonly sessionsService: SessionsService,
        private readonly storageService: StorageService,
        private readonly videoService: VideoService,
    ) { }

    @ApiOperation({ summary: 'Create a new session', operationId: 'createSession' })
    @ApiResponse({ status: 201, description: 'The session has been successfully created.', type: Session })
    @Post()
    create(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(createSessionDto);
    }

    @ApiOperation({ summary: 'Update an existing session', operationId: 'updateSession' })
    @ApiResponse({ status: 200, description: 'The session has been successfully updated.', type: Session })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
        return this.sessionsService.update(id, updateSessionDto);
    }

    @ApiOperation({ summary: 'Mark a session as completed', operationId: 'completeSession' })
    @ApiResponse({ status: 200, description: 'The session has been marked as completed.', type: Session })
    @Post(':id/complete')
    complete(@Param('id') id: string) {
        return this.sessionsService.complete(id);
    }

    @ApiOperation({ summary: 'Upload a media file for the session', operationId: 'uploadSessionMedia' })
    @ApiConsumes('multipart/form-data')
    @ApiQuery({ name: 'type', enum: ['ORIGINAL', 'PROCESSED', 'VIDEO'], required: false, description: 'Type of media (default: ORIGINAL)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'The file has been successfully uploaded.', type: Media })
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    async uploadFile(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Query('type') type: 'ORIGINAL' | 'PROCESSED' | 'VIDEO' = 'ORIGINAL',
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        let finalBuffer = file.buffer;
        let finalMimeType = file.mimetype;

        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname.replace(/\s+/g, '-'); // Sanitize
        let filename = `sessions/${id}/${uniqueSuffix}-${originalName}`;

        // Check if conversion is needed (WebM -> MP4)
        if (file.mimetype === 'video/webm' || file.mimetype === 'video/x-matroska') {
            try {
                finalBuffer = await this.videoService.convertWebMToMp4(file.buffer);
                finalMimeType = 'video/mp4';
                // Change extension in filename
                if (filename.endsWith('.webm')) {
                    filename = filename.replace('.webm', '.mp4');
                } else if (filename.endsWith('.mkv')) {
                    filename = filename.replace('.mkv', '.mp4');
                } else {
                    filename = filename + '.mp4';
                }
            } catch (error) {
                console.error('Video conversion failed, uploading original file', error);
                // Fallback: upload original
            }
        }

        // Upload to GCS
        const fileUrl = await this.storageService.uploadFile(filename, finalBuffer, finalMimeType);

        const media = await this.sessionsService.addMedia(id, fileUrl, type);
        return media;
    }

    @ApiOperation({ summary: 'Get session details by ID', operationId: 'getSession' })
    @ApiResponse({ status: 200, description: 'Return the session with all associated media.', type: Session })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }
}
