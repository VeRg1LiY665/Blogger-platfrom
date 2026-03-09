import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { GetCurrentGameQuery } from '../application/queries/public/get-current-game.query';
import { GameViewDto } from './view-dto/game.view-dto';
import { GetGameByIdQuery } from '../application/queries/public/get-game-by-id.query';
import { ConnectToGameCommand } from '../application/usecases/quiz-game/connect-to-game.usecase';
import { SendNextQuestionAnswerCommand } from '../application/usecases/quiz-game/send-next-question.usecase';
import { AnswerViewDto } from './view-dto/answer.view-dto';
import { UUIDValidationPipe } from '../../../core/pipes/uuid-validation-pipe.service';
import { GetMyGamesQuery } from '../application/queries/public/get-my-games.query';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetGamesQueryParams } from './input-dto/get-gamesquery-params.input-dto';
import { UserStatisticsViewDto } from './view-dto/player-statistics.view-dto';
import { GetMyStatisticsQuery } from '../application/queries/public/get-user-statistics.usecase';

@Controller('pair-game-quiz')
export class QuizGameController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Get('/users/my-statistic')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getMyStatistics(@ExtractUserFromRequest() user: UserContextDto): Promise<UserStatisticsViewDto> {
        return await this.queryBus.execute<GetMyStatisticsQuery>(new GetMyStatisticsQuery(user.id));
    }

    @Get('/pairs/my')
    @UseGuards(JwtAuthGuard)
    async getMyGames(
        @Query() query: GetGamesQueryParams,
        @ExtractUserFromRequest() user: UserContextDto
    ): Promise<PaginatedViewDto<GameViewDto[]>> {
        return await this.queryBus.execute<GetMyGamesQuery>(new GetMyGamesQuery(query, user.id));
    }

    @Get('/pairs/my-current')
    @UseGuards(JwtAuthGuard)
    async getCurrent(@ExtractUserFromRequest() user: UserContextDto): Promise<GameViewDto> {
        return await this.queryBus.execute<GetCurrentGameQuery>(new GetCurrentGameQuery(user.id));
    }

    @Get('/pairs/:id')
    @UseGuards(JwtAuthGuard)
    async getOne(
        @ExtractUserFromRequest() user: UserContextDto,
        @Param('id', UUIDValidationPipe) id: string
    ): Promise<GameViewDto> {
        const dto = {
            userId: user.id,
            gameId: id
        };
        return await this.queryBus.execute<GetGameByIdQuery>(new GetGameByIdQuery(dto));
    }

    @Post('/pairs/connection')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async connect(@ExtractUserFromRequest() user: UserContextDto): Promise<GameViewDto> {
        const dto = { userId: user.id, gameId: '' };
        const gameId = await this.commandBus.execute<ConnectToGameCommand, string>(new ConnectToGameCommand(dto));

        dto.gameId = gameId;
        return await this.queryBus.execute<GetGameByIdQuery>(new GetGameByIdQuery(dto));
    }

    @Post('/pairs/my-current/answers')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async myAnswers(@ExtractUserFromRequest() user: UserContextDto, @Body() answer: string): Promise<AnswerViewDto> {
        const dto = {
            userId: user.id,
            answer: answer
        };
        return await this.commandBus.execute<SendNextQuestionAnswerCommand, AnswerViewDto>(
            new SendNextQuestionAnswerCommand(dto)
        );
    }
}
