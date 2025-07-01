import { Module } from '@nestjs/common';
import { User, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQRepository } from './infrastructure/users.query-repository';
import { UsersExtQRepository } from './infrastructure/external-query/users.external-query-repository';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoService } from './application/crypto.service';
import { AuthService } from './application/auth.service';
import { /*JwtModule,*/ JwtService } from '@nestjs/jwt';
import { AuthController } from './api/auth.controller';
import { AuthQueryRepository } from './infrastructure/auth.query-repository';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { UsersFactory } from './application/factories/users.factory';

const commandHandlers = [
    /*DeleteUserUseCase,
    RegisterUserUseCase,*/
    CreateUserUseCase
];

@Module({
    imports: [
        /*JwtModule.register({
            secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
            signOptions: { expiresIn: '10m' } // Время жизни токена
        }),*/
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        NotificationsModule,
        PassportModule
    ],
    controllers: [UsersController, AuthController],
    providers: [
        UsersService,
        UsersRepository,
        UsersQRepository,
        UsersExtQRepository,
        CryptoService,
        AuthService,
        AuthQueryRepository,
        JwtService,
        LocalStrategy,
        JwtStrategy,
        ...commandHandlers, //не забывать регстрировать команды
        UsersFactory //не забывать регистрировать фабрики
    ],
    exports: [/*JwtModule*/ UsersExtQRepository]
})
export class UsersAccountsModule {}
