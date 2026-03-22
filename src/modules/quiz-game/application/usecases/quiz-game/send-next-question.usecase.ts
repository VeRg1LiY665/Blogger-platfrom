import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesSqlRepository } from '../../../infrastructure/games-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameEntity } from '../../../domain/game.entity';
import { AnswerViewDto } from '../../../api/view-dto/answer.view-dto';
import { AnswerQuestionDto } from '../../../dto/answer-question.dto';
import { AnswersFactory } from '../../factories/answer.factory';
import { AnswerStatus } from '../../../domain/constants/answer-status.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class SendNextQuestionAnswerCommand {
    constructor(public dto: AnswerQuestionDto) {}
}

/**
 * Отправка следующего ответа к существующей игре
 */

@CommandHandler(SendNextQuestionAnswerCommand)
export class SendNextQuestionAnswerUseCase implements ICommandHandler<SendNextQuestionAnswerCommand, AnswerViewDto> {
    constructor(
        @InjectQueue('finishGameWithDelay') private finishGameQueue: Queue,
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

        for (const [index, p] of Agame.playerProgress.entries()) {
            if (p.playerId === dto.userId && p.answers.length < Agame.questions.length) {
                const i = p.answers.length;
                const flag: boolean = Agame.questions[i].correctAnswers.some(
                    (x) => x == Object.values(dto.answer).toString()
                );
                const answer = this.answersFactory.create(Agame.questions[i].questionId, flag);
                p.answers.push(answer);

                if (answer.answerStatus == AnswerStatus.Correct) {
                    p.playerScore++;
                }

                if (p.answers.length == Agame.questions.length && Agame.firstFinished !== 255) {
                    Agame.finishGame(Agame.firstFinished);
                }

                if (p.answers.length == Agame.questions.length && Agame.firstFinished == 255) {
                    Agame.firstFinished = index;
                    console.log(Agame.id);
                    const dto = {
                        userId: p.playerId,
                        firstFinished: index
                    };
                    await this.finishGameQueue.add('waiting for game termination', dto);
                }

                Agame.countTotalNumberOfAnswers();
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
