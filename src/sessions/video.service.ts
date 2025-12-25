import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);

    async convertWebMToMp4(inputBuffer: Buffer): Promise<Buffer> {
        const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const inputPath = path.join(os.tmpdir(), `input-${uniqueId}.webm`);
        const outputPath = path.join(os.tmpdir(), `output-${uniqueId}.mp4`);

        try {
            // Write input buffer to temp file
            await fs.promises.writeFile(inputPath, inputBuffer);

            this.logger.log(`Starting conversion: ${inputPath} -> ${outputPath}`);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(inputPath)
                    .output(outputPath)
                    // 1. Force Codec H.264 (Standard for all devices)
                    .videoCodec('libx264')

                    // 2. CRITICAL FOR SAFARI: Pixel Format must be yuv420p
                    .outputOptions('-pix_fmt yuv420p')

                    // 3. Force Audio Codec AAC (Safari dislikes Opus/MP3 in MP4 container)
                    .audioCodec('aac')

                    // 4. Move metadata to front (Fast Start)
                    .outputOptions('-movflags +faststart')

                    // Optional: Fast preset
                    .outputOptions('-preset fast')

                    .on('end', () => {
                        this.logger.log('Video conversion completed successfully');
                        resolve();
                    })
                    .on('error', (err) => {
                        this.logger.error(`Error converting video: ${err.message}`);
                        reject(err);
                    })
                    .run();
            });

            // Read the converted file back into a buffer
            const outputBuffer = await fs.promises.readFile(outputPath);
            return outputBuffer;

        } catch (error) {
            this.logger.error(`Failed to convert video: ${error.message}`);
            throw new InternalServerErrorException('Video conversion failed');
        } finally {
            // Cleanup temp files
            try {
                if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath);
                if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
            } catch (cleanupErr) {
                this.logger.warn(`Failed to cleanup temp files: ${cleanupErr.message}`);
            }
        }
    }
}
