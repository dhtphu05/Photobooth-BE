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

@ApiTags('Sessions')
@Controller('api/sessions')
export class SessionsController {
    constructor(
        private readonly sessionsService: SessionsService,
        private readonly storageService: StorageService,
    ) { }

    @ApiOperation({ summary: 'Create a new session' })
    @ApiResponse({ status: 201, description: 'The session has been successfully created.', type: Session })
    @Post()
    create(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(createSessionDto);
    }

    @ApiOperation({ summary: 'Update an existing session' })
    @ApiResponse({ status: 200, description: 'The session has been successfully updated.', type: Session })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
        return this.sessionsService.update(id, updateSessionDto);
    }

    @ApiOperation({ summary: 'Mark a session as completed' })
    @ApiResponse({ status: 200, description: 'The session has been marked as completed.', type: Session })
    @Post(':id/complete')
    complete(@Param('id') id: string) {
        return this.sessionsService.complete(id);
    }

    @ApiOperation({ summary: 'Upload a media file for the session' })
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

        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname.replace(/\s+/g, '-'); // Sanitize
        const filename = `sessions/${id}/${uniqueSuffix}-${originalName}`;

        // Upload to GCS
        const fileUrl = await this.storageService.uploadFile(filename, file.buffer, file.mimetype);

        const media = await this.sessionsService.addMedia(id, fileUrl, type);
        return media;
    }

    @ApiOperation({ summary: 'Get session details by ID' })
    @ApiResponse({ status: 200, description: 'Return the session with all associated media.', type: Session })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }
}
