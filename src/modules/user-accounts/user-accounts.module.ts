import { Module } from '@nestjs/common';
import { User, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GetDeviceInfoInterceptor } from './interceptors/get-device-info.interceptor';
import { SecurityDevicesRepository } from './infrastructure/security-devices.repository';
import { SecurityDevice, SecurityDeviceSchema } from './domain/device.entity';
import { RefreshTokenUserUseCase } from './application/usecases/refresh-token-user.usecase';
import { RefreshStrategy } from './guards/bearer/refresh.strategy';
import { GetAllDevicesQueryHandler } from './application/queries/get-devices-for-user.usecase';
import { SecurityDevicesQueryRepository } from './infrastructure/security-devices.query-repository';
import { SecurityDevicesController } from './api/security-devices.controller';
import { DeleteAllDevicesUseCase } from './application/usecases/security-devices/delete-all-except-current-device.usecase';
import { DeleteDeviceUseCase } from './application/usecases/security-devices/delete-device.usecase';
import { IatFactory } from './application/factories/Iat.factory';

const commandHandlers = [
    DeleteUserUseCase,
    CreateUserUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    ConfirmRegistrationUserUseCase,
    EmailResendingUserUseCase,
    PasswordRecoveryUserUseCase,
    NewPasswordUserUseCase,
    RefreshTokenUserUseCase,
    DeleteDeviceUseCase,
    DeleteAllDevicesUseCase
];
const queryHandlers = [GetUserByIdQueryHandler, GetAllUsersQueryHandler, GetAllDevicesQueryHandler];
@Module({
    imports: [
        /*JwtModule.register({
            secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
            signOptions: { expiresIn: '10m' } // Время жизни токена
        }),*/
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: SecurityDevice.name, schema: SecurityDeviceSchema }]),
        NotificationsModule,
        PassportModule
    ],
    controllers: [UsersController, AuthController, SecurityDevicesController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: GetDeviceInfoInterceptor
        },
        UsersRepository,
        UsersQRepository,
        UsersExtQRepository,
        CryptoService,
        AuthService,
        AuthQueryRepository,
        JwtService,
        LocalStrategy,
        JwtStrategy,
        RefreshStrategy,
        ...commandHandlers, //не забывать регстрировать команды
        ...queryHandlers,
        UsersFactory, //не забывать регистрировать фабрики
        IatFactory,
        SecurityDevicesRepository,
        SecurityDevicesQueryRepository
    ],
    exports: [/*JwtModule*/ UsersExtQRepository]
})
export class UsersAccountsModule {}
