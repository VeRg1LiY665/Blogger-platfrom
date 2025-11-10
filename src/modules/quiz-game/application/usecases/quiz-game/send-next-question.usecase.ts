import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesSqlRepository } from '../../../infrastructure/games-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameEntity } from '../../../domain/game.entity';
import { AnswerViewDto } from '../../../api/view-dto/answer.view-dto';
import { AnswerQuestionDto } from '../../../dto/answer-question.dto';
import { AnswersFactory } from '../../factories/answer.factory';
import { AnswerStatus } from '../../../domain/constants/answer-status.constants';

export class SendNextQuestionAnswerCommand {
    constructor(public dto: AnswerQuestionDto) {}
}

/**
 * Отправка следующего ответа к существующей игре
 */

@CommandHandler(SendNextQuestionAnswerCommand)
export class SendNextQuestionAnswerUseCase implements ICommandHandler<SendNextQuestionAnswerCommand, AnswerViewDto> {
    constructor(
        private gamesSqlRepository: GamesSqlRepository,
        private answersFactory: AnswersFactory
    ) {}

    async execute({ dto }: SendNextQuestionAnswerCommand): Promise<AnswerViewDto> {
        const Agame: GameEntity | null = await this.gamesSqlRepository.findActiveByPlayer(dto.userId);
        if (!Agame) {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'User does not participate in game'
            });
        }

        for (const p of Agame.playerProgress) {
            if (p.playerId === dto.userId && p.answers.length < Agame.questions.length) {
                const i = p.answers.length;
                const flag: boolean = Agame.questions[i].correctAnswers.some((x) => x == dto.answer);
                const answer = this.answersFactory.create(Agame.questions[i].id, flag);
                p.answers.push(answer);

                if (answer.answerStatus == AnswerStatus.Correct) {
                    p.playerScore++;
                }

                if (p.answers.length == Agame.questions.length && Agame.firstFinished == true) {
                    Agame.finishGame();
                }

                if (p.answers.length == Agame.questions.length && Agame.firstFinished == false) {
                    p.playerScore++; //add 1 point for the first player to answer all questions
                    Agame.firstFinished = true;
                }

                await this.gamesSqlRepository.save(Agame);

                return AnswerViewDto.mapSqlToView(answer);
            }
        }

        throw new DomainException({
            code: DomainExceptionCode.Forbidden,
            message: 'User has been answered to all questions'
        });
    }
}
