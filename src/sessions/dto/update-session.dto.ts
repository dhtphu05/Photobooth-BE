export class UpdateSessionDto {
    status?: 'INIT' | 'SELECTING' | 'COUNTDOWN' | 'CAPTURING' | 'COMPLETED';
    selectedFilter?: string;
    selectedFrame?: string;
}
