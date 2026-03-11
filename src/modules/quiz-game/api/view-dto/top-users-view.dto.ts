import { UserStatisticsViewDto } from './player-statistics.view-dto';

export class TopUsersViewDto extends UserStatisticsViewDto {
    player: {
        id: string;
        login: string;
    };
}
