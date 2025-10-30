export class CreateGameQuestionDomainDto {
    id: string;
    body: string;
    correctAnswers: string[];
    gameId: string;
}
