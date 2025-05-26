import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { InputUserDto } from './input-dto/users.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params';
import { UserViewDto } from './view-dto/users-view.dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: InputUserDto): Promise<UserViewDto> {
        return await this.usersService.createUser(createUserDto);
    }
    @Get()
    async findAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        return await this.usersService.getAllUsers(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserViewDto> {
        return await this.usersService.findById(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        return await this.usersService.removeUser(id);
    }
}
