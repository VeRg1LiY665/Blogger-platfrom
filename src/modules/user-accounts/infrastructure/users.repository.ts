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

    async findByUUID(uuid: string): Promise<UserDocument | null> {
        const filter = { emailConfirmation: { recoveryCode: uuid } };
        //filter['passwordRecovery.recoveryCode'] = uuid;
        const result = await this.userModel.findOne(filter);
        console.log(filter);
        return result;
    }

    async findByLogin(login: string): Promise<UserDocument | null> {
        return await this.userModel.findOne({ login });
    }

    async findByLoginOrEmail(searchData: string): Promise<UserDocument | null> {
        const filter: any = {};

        switch (true) {
            case searchData.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null:
                filter.email = searchData;
                break;
            default:
                filter.login = searchData;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const user = await this.userModel.findOne(filter);

        if (!user) {
            return null;
        }
        return user;
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
