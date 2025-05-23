import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { NotFoundException } from '@nestjs/common';
import { UserExternalDto } from './external-dto/users.external-dto';

export class UsersExtQRepository {
    constructor(@InjectModel(User.name) private userModel: UserModelType) {}

    async findById(userId: string): Promise<UserExternalDto> {
        const user = await this.userModel.findById({
            _id: userId
        });
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return UserExternalDto.mapToView(user);
    }
}
