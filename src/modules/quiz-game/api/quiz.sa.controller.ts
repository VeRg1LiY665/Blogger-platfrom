import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetQuestionsQueryParams } from './input-dto/get-questions-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from './view-dto/questions.view-dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { QuestionInputDto } from './input-dto/question.input-dto';
import { GetAllQuestionsAdminsQuery } from '../application/queries/admins/get-all-questions-admins.query';
import { CreateQuestionCommand } from '../application/usecases/admins/create-question.usecase';
import { GetQuestionByIdQuery } from '../application/queries/public/get-question-by-id.query';
import { DeleteQuestionCommand } from '../application/usecases/admins/delete-question.usecase';
import { UpdateQuestionCommand } from '../application/usecases/admins/update-question.usecase';
import { PublishQuestionCommand } from '../application/usecases/admins/publish-question.usecase';
import { PublishInputDto } from './input-dto/publish.input-dto';
import { UUIDValidationPipe } from '../../../core/pipes/uuid-validation-pipe.service';

@Controller('sa/quiz')
export class QuizSaController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    @Get('/questions')
    @UseGuards(BasicAuthGuard)
    async getAllQuestions(@Query() query: GetQuestionsQueryParams): Promise<PaginatedViewDto<QuestionViewDto[]>> {
        return await this.queryBus.execute<GetAllQuestionsAdminsQuery>(new GetAllQuestionsAdminsQuery(query));
    }

    @Post('/questions')
    @UseGuards(BasicAuthGuard)
    async createQuestion(@Body() body: QuestionInputDto): Promise<QuestionViewDto> {
        const newQuestionId = await this.commandBus.execute<CreateQuestionCommand, string>(
            new CreateQuestionCommand(body)
        );
        return await this.queryBus.execute<GetQuestionByIdQuery>(new GetQuestionByIdQuery(newQuestionId));
    }

    @Delete('/questions/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async deleteQuestion(@Param('id', UUIDValidationPipe) id: string): Promise<void> {
        return await this.commandBus.execute<DeleteQuestionCommand, void>(new DeleteQuestionCommand(id));
    }

    @Put('/questions/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async updateQuestion(@Param('id', UUIDValidationPipe) id: string, @Body() body: QuestionInputDto): Promise<void> {
        const dto = { id: id, ...body };
        return await this.commandBus.execute<UpdateQuestionCommand, void>(new UpdateQuestionCommand(dto));
    }

    @Put('/questions/:id/publish')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async publishUnpublishQuestion(
        @Param('id', UUIDValidationPipe) id: string,
        @Body() body: PublishInputDto
    ): Promise<void> {
        const dto = { id: id, ...body };
        return await this.commandBus.execute<PublishQuestionCommand>(new PublishQuestionCommand(dto));
    }
}
