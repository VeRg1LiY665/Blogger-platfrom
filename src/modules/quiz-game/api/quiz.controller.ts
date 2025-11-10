import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
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

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Get('/my-current')
    @UseGuards(JwtAuthGuard)
    async getCurrent(@ExtractUserFromRequest() user: UserContextDto): Promise<GameViewDto> {
        return await this.queryBus.execute<GetCurrentGameQuery>(new GetCurrentGameQuery(user.id));
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    async getOne(@Param('id') id: string): Promise<GameViewDto> {
        return await this.queryBus.execute<GetGameByIdQuery>(new GetGameByIdQuery(id));
    }

    @Post('connection')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async connect(@ExtractUserFromRequest() user: UserContextDto): Promise<GameViewDto> {
        const dto = { userId: user.id };
        const gameId = await this.commandBus.execute<ConnectToGameCommand, string>(new ConnectToGameCommand(dto));

        return await this.queryBus.execute<GetGameByIdQuery>(new GetGameByIdQuery(gameId));
    }

    @Post('my-current/answers')
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
