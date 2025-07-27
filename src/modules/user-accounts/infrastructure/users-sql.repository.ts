import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Types } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class UsersSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    async findById(id: string): Promise<User | null> {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        console.log(result);
        return result as any;
    }

    /*async findByUUID(uuid: string): Promise<UserDocument | null> {
        const filter = {};

        switch (true) {
            case uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null:
                filter['emailConfirmation.confirmationCode'] = uuid;
                break;
            case uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-rq$/) !== null:
                filter['passwordRecovery.recoveryCode'] = uuid;
                break;
        }

        const result = await this.userModel.findOne(filter);

        return result;
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
    }*/
}
