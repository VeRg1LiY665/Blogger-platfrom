import { Module } from '@nestjs/common';
import { User, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQRepository } from './infrastructure/users.query-repository';
import { UsersExtQRepository } from './infrastructure/external-query/users.external-query-repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, UsersQRepository, UsersExtQRepository],
    exports: [UsersExtQRepository]
})
export class UsersAccountsModule {}
