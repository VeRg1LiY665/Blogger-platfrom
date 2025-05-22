import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { NotFoundException } from '@nestjs/common';

export class UsersQRepository {
    constructor(@InjectModel(User.name) private userModel: UserModelType) {}

    async findAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {}

    async findById(id: string): Promise<UserViewDto> {
        const user = await this.userModel.findById({
            _id: id
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return UserViewDto.mapToView(user);
    }
}
