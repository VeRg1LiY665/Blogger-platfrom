import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Types } from 'mongoose';

export class UsersRepository {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType
    ) {}

    async findById(id: string): Promise<UserDocument | null> {
        const result = await this.userModel.findOne({
            _id: id
        });

        return result;
    }

    findByLogin(login: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ login });
    }

    async findOrNotFoundFail(id: Types.ObjectId): Promise<UserDocument> {
        const user = await this.findById(id.toString());

        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        return user;
    }

    async save(user: UserDocument): Promise<void> {
        await user.save();
    }

    async delete(userId: string): Promise<void> {
        await this.userModel.deleteOne({ _id: userId });
        return;
    }
}
