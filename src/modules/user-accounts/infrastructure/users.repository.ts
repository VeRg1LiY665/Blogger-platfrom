import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';

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

    async save(user: UserDocument): Promise<void> {
        await user.save();
    }

    async delete(userId: string): Promise<void> {
        await this.userModel.deleteOne({ _id: userId });
        return;
    }
}
