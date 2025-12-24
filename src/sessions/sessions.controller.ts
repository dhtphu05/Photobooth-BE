import { Controller, Post, Body, Patch, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Session } from '../entities/session.entity';
import { Media } from '../entities/media.entity';

@ApiTags('Sessions')
@Controller('api/sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

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
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        const fileUrl = `/uploads/${file.filename}`;
        const media = await this.sessionsService.addMedia(id, fileUrl, 'ORIGINAL');
        // Note: In a real app, you might distinguish between ORIGINAL and PROCESSED based on a query param or separate endpoint
        return media;
    }
}
