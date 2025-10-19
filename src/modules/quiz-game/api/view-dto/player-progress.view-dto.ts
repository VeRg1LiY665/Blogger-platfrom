import { AnswerViewDto } from './answer.view-dto';

export class PlayerProgressViewDto {
    answers: AnswerViewDto[];
    player: {
        id: string;
        login: string;
    };
    score: number;
}
