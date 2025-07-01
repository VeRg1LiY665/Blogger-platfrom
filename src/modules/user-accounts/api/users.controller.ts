import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersService } from '../application/users.service';
import { InputUserDto } from './input-dto/users.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params';
import { UserViewDto } from './view-dto/users-view.dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CreateUserCommand } from '../application/usecases/admins/create-user.usecase';
import { Types } from 'mongoose';
import { UsersQRepository } from '../infrastructure/users.query-repository';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private readonly commandBus: CommandBus
    ) {}

    @Post()
    @UseGuards(BasicAuthGuard)
    async create(@Body() createUserDto: InputUserDto): Promise<UserViewDto> {
        const createdId = await this.commandBus.execute<CreateUserCommand, Types.ObjectId>(
            new CreateUserCommand(createUserDto)
        );
        return await this.usersService.findById(createdId.toString());
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(BasicAuthGuard)
    async findAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        return await this.usersService.getAllUsers(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserViewDto> {
        return await this.usersService.findById(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async delete(@Param('id') id: string): Promise<void> {
        return await this.usersService.removeUser(id);
    }
}
