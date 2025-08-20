import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InputUserDto } from './input-dto/users.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params';
import { UserViewDto } from './view-dto/users-view.dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CreateUserCommand } from '../application/usecases/admins/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/admins/delete-user.usecase';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { GetAllUsersQuery } from '../application/queries/get-all-users.query';

@Controller('sa/users')
export class UsersController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Post()
    @UseGuards(BasicAuthGuard)
    async create(@Body() createUserDto: InputUserDto): Promise<UserViewDto> {
        const createdId = await this.commandBus.execute<CreateUserCommand, number>(
            new CreateUserCommand(createUserDto)
        );

        return await this.queryBus.execute<GetUserByIdQuery>(new GetUserByIdQuery(createdId.toString()));
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(BasicAuthGuard)
    async findAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        return await this.queryBus.execute<GetAllUsersQuery>(new GetAllUsersQuery(query));
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserViewDto> {
        return await this.queryBus.execute<GetUserByIdQuery>(new GetUserByIdQuery(id));
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async delete(@Param('id') id: string): Promise<void> {
        return await this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(id));
    }
}
