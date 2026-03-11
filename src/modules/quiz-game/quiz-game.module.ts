import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.modules';
import { QuizSaController } from './api/quiz.sa.controller';
import { QuestionsSqlQRepository } from './infrastructure/questions-sql.query.repository';
import { QuestionsSqlRepository } from './infrastructure/questions-sql.repository';
import { CreateQuestionUseCase } from './application/usecases/admins/create-question.usecase';
import { PublishQuestionUseCase } from './application/usecases/admins/publish-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/admins/update-question.usecase';
import { GetAllQuestionsAdminsQueryHandler } from './application/queries/admins/get-all-questions-admins.query';
import { GetQuestionByIdQueryHandler } from './application/queries/public/get-question-by-id.query';
import { ConnectToGameUseCase } from './application/usecases/quiz-game/connect-to-game.usecase';
import { SendNextQuestionAnswerUseCase } from './application/usecases/quiz-game/send-next-question.usecase';
import { GetCurrentGameQueryHandler } from './application/queries/public/get-current-game.query';
import { GetGameByIdQueryHandler } from './application/queries/public/get-game-by-id.query';
import { QuizGameConfig } from './config/quiz-game.config';
import { GameQuestionsFactory } from './application/factories/game-questions.factory';
import { GamesSqlRepository } from './infrastructure/games-sql.repository';
import { GamesSqlQueryRepository } from './infrastructure/games-sql.query.repository';
import { AnswersFactory } from './application/factories/answer.factory';
import { UsersExtSqlQRepository } from '../user-accounts/infrastructure/external-query/users.external-sql-query-repository';
import { QuizGameController } from './api/quiz.controller';
import { DeleteQuestionUseCase } from './application/usecases/admins/delete-question.usecase';
import { UserAccountsConfig } from '../user-accounts/config/user-accounts.config';
import { DataSource } from 'typeorm';
import { GetMyGamesQueryHandler } from './application/queries/public/get-my-games.query';
import { GetMyStatisticsQueryHandler } from './application/queries/public/get-user-statistics.usecase';
import { GetTopUsersQueryHandler } from './application/queries/public/get-top-users.query';

const commandHandlers = [
    CreateQuestionUseCase,
    DeleteQuestionUseCase,
    PublishQuestionUseCase,
    UpdateQuestionUseCase,
    ConnectToGameUseCase,
    SendNextQuestionAnswerUseCase
];

const queryHandlers = [
    GetAllQuestionsAdminsQueryHandler,
    GetQuestionByIdQueryHandler,
    GetCurrentGameQueryHandler,
    GetGameByIdQueryHandler,
    GetMyGamesQueryHandler,
    GetMyStatisticsQueryHandler,
    GetTopUsersQueryHandler
];

@Module({
    imports: [DatabaseModule],
    controllers: [QuizSaController, QuizGameController],
    providers: [
        {
            provide: GameQuestionsFactory,
            useFactory: (
                questionsSqlRepository: QuestionsSqlRepository,
                quizGameConfig: QuizGameConfig
            ): GameQuestionsFactory => {
                return new GameQuestionsFactory(questionsSqlRepository, quizGameConfig.questionLimit);
            },
            inject: [QuestionsSqlRepository, QuizGameConfig]
        },
        {
            provide: GamesSqlQueryRepository,
            useFactory: (datasource: DataSource, quizGameConfig: QuizGameConfig): GamesSqlQueryRepository => {
                return new GamesSqlQueryRepository(datasource, quizGameConfig.questionLimit);
            },
            inject: [DataSource, QuizGameConfig]
        },
        AnswersFactory,
        QuestionsSqlQRepository,
        QuestionsSqlRepository,
        GamesSqlRepository,
        //GamesSqlQueryRepository,
        UsersExtSqlQRepository,
        ...commandHandlers,
        ...queryHandlers,
        QuizGameConfig,
        UserAccountsConfig //For basic auth credentials
    ]
})
export class QuizGameModule {}
