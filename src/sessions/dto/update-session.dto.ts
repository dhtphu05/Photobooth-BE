import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto {
    @ApiPropertyOptional({ enum: ['INIT', 'SELECTING', 'COUNTDOWN', 'CAPTURING', 'COMPLETED'] })
    status?: 'INIT' | 'SELECTING' | 'COUNTDOWN' | 'CAPTURING' | 'COMPLETED';

    @ApiPropertyOptional({ description: 'Selected filter identifier' })
    selectedFilter?: string;

    @ApiPropertyOptional({ description: 'Selected frame identifier' })
    selectedFrame?: string;
}
