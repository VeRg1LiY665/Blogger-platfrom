import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Post } from '../../bloggers-platform/domain/post.entity';

export class UsersQRepository {
    constructor(@InjectModel(User.name) private userModel: UserModelType) {}

    async findAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        let filter: FilterQuery<Post> = {};
        if (query.searchLoginTerm) {
            filter = {
                login: { $regex: query.searchLoginTerm, $options: 'i' }
            };
        }

        if (query.searchEmailTerm) {
            filter = {
                email: { $regex: query.searchEmailTerm, $options: 'i' }
            };
        }

        const users = await this.userModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.userModel.countDocuments(filter);

        const items = users.map((x) => UserViewDto.mapToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

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
