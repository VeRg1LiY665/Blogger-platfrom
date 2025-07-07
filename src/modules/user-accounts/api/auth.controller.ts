import { Body, Controller, Post, UseGuards, Get, HttpCode, HttpStatus, Res, UseInterceptors } from '@nestjs/common';
import { InputUserDto } from './input-dto/users.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users-view.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { InputConfirmEmailDto } from './input-dto/input-registration-confirmation';
import { InputEmailResendingDto } from './input-dto/input-email-resending';
import { InputPasswordRecoveryDto } from './input-dto/input-password-recovery';
import { InputNewPasswordDto } from './input-dto/input-new-password-dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { ConfirmRegistrationUserCommand } from '../application/usecases/users/confirm-registration-user.usecase';
import { EmailResendingUserCommand } from '../application/usecases/users/email-resending-user.usecase';
import { PasswordRecoveryUserCommand } from '../application/usecases/users/password-recovery-user.usecase';
import { NewPasswordUserCommand } from '../application/usecases/users/new-password-user.usecase';
import { GetDeviceInfoInterceptor } from '../interceptors/get-device-info.interceptor';
import { ExtractDeviceInfoFromRequest } from '../interceptors/decorators/extract-device-info-from-request.decorator';
import { DeviceContextDto } from '../interceptors/dto/device-context.dto';
import { RefreshGuard } from '../guards/bearer/refresh.guard';
import { ExtractUserForRefreshFromRequest } from '../guards/decorators/param/extract-user-for-refresh-from-request.decorator';
import { RefreshContextDto } from '../guards/dto/refresh-context.dto';
import { RefreshTokenUserCommand } from '../application/usecases/refresh-token-user.usecase';

@Controller('auth')
export class AuthController {
    constructor(
        private authQueryRepository: AuthQueryRepository,
        private readonly commandBus: CommandBus
    ) {}
    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    registration(@Body() body: InputUserDto): Promise<void> {
        return this.commandBus.execute<RegisterUserCommand, void>(new RegisterUserCommand(body));
    }

    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    registrationConfirmation(@Body() body: InputConfirmEmailDto): Promise<void> {
        return this.commandBus.execute<ConfirmRegistrationUserCommand, void>(new ConfirmRegistrationUserCommand(body));
    }

    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    emailResending(@Body() body: InputEmailResendingDto): Promise<void> {
        return this.commandBus.execute<EmailResendingUserCommand, void>(new EmailResendingUserCommand(body));
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard, LocalAuthGuard)
    @UseInterceptors(GetDeviceInfoInterceptor)
    //swagger doc
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                login: { type: 'string', example: 'login123' },
                password: { type: 'string', example: 'superpassword' }
            }
        }
    })
    async login(
        @ExtractUserFromRequest() user: UserContextDto,
        @ExtractDeviceInfoFromRequest() deviceInfo: DeviceContextDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const dto = {
            userId: user.id,
            ip: deviceInfo.ip,
            title: deviceInfo.userAgent
        };
        const { accessToken, refreshToken } = await this.commandBus.execute<
            LoginUserCommand,
            { accessToken: string; refreshToken: string }
        >(new LoginUserCommand(dto));

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Important for security
            secure: true, // Use secure in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // e.g., 7 days in milliseconds
            sameSite: 'strict' // CSRF protection
        });

        return { accessToken: accessToken };
    }

    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    passwordRecovery(@Body() body: InputPasswordRecoveryDto): Promise<void> {
        return this.commandBus.execute<PasswordRecoveryUserCommand>(new PasswordRecoveryUserCommand(body));
    }

    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    newPassword(@Body() body: InputNewPasswordDto): Promise<void> {
        return this.commandBus.execute<NewPasswordUserCommand, void>(new NewPasswordUserCommand(body));
    }

    @ApiBearerAuth()
    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
        console.log(user);
        return this.authQueryRepository.me(user.id);
    }

    @ApiBearerAuth()
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshGuard)
    async refreshToken(
        @ExtractUserForRefreshFromRequest() user: RefreshContextDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const dto = {
            userId: user.id,
            deviceId: user.deviceId,
            iat: user.iat,
            rem: user.rem
        };

        const { accessToken, refreshToken } = await this.commandBus.execute<
            RefreshTokenUserCommand,
            { accessToken: string; refreshToken: string }
        >(new RefreshTokenUserCommand(dto));

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Important for security
            secure: true, // Use secure in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // e.g., 7 days in milliseconds
            sameSite: 'strict' // CSRF protection
        });

        return { accessToken: accessToken };
    }
}
