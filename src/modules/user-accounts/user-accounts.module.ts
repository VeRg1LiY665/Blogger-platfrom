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
import { DeleteUserUseCase } from './application/usecases/admins/delete-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { ConfirmRegistrationUserUseCase } from './application/usecases/users/confirm-registration-user.usecase';
import { EmailResendingUserUseCase } from './application/usecases/users/email-resending-user.usecase';
import { PasswordRecoveryUserUseCase } from './application/usecases/users/password-recovery-user.usecase';
import { NewPasswordUserUseCase } from './application/usecases/users/new-password-user.usecase';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.query';

const commandHandlers = [
    DeleteUserUseCase,
    CreateUserUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    ConfirmRegistrationUserUseCase,
    EmailResendingUserUseCase,
    PasswordRecoveryUserUseCase,
    NewPasswordUserUseCase
];
const queryHandlers = [GetUserByIdQueryHandler, GetAllUsersQueryHandler];
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
        ...queryHandlers,
        UsersFactory //не забывать регистрировать фабрики
    ],
    exports: [/*JwtModule*/ UsersExtQRepository]
})
export class UsersAccountsModule {}
