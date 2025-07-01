import { Body, Controller, Post, UseGuards, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { InputUserDto } from './input-dto/users.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Nullable, UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users-view.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../guards/decorators/extract-user-if-exists-from-request.decorator';
import { AuthQueryRepository } from '../infrastructure/auth.query-repository';
import { InputConfirmEmailDto } from './input-dto/input-registration-confirmation';
import { InputEmailResendingDto } from './input-dto/input-email-resending';
import { InputPasswordRecoveryDto } from './input-dto/input-password-recovery';
import { InputNewPasswordDto } from './input-dto/input-new-password-dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';

@Controller('auth')
export class AuthController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService,
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
        return this.usersService.confirmRegistration(body);
    }

    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    emailResending(@Body() body: InputEmailResendingDto): Promise<void> {
        return this.usersService.emailResending(body);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
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
        /*@Request() req: any*/
        @ExtractUserFromRequest() user: UserContextDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const { accessToken, refreshToken } = await this.authService.login(user.id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Important for security
            secure: true, // Use secure in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // e.g., 7 days in milliseconds
            sameSite: 'strict' // Or 'strict' depending on your needs
        });

        return { accessToken: accessToken };
    }

    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    passwordRecovery(@Body() body: InputPasswordRecoveryDto): Promise<void> {
        return this.usersService.passwordRecovery(body);
    }

    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    newPassword(@Body() body: InputNewPasswordDto): Promise<void> {
        return this.usersService.newPassword(body);
    }

    @ApiBearerAuth()
    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
        return this.authQueryRepository.me(user.id);
    }

    /* @ApiBearerAuth()
    @Get('me-or-default')
    @UseGuards(JwtOptionalAuthGuard)
    async meOrDefault(@ExtractUserIfExistsFromRequest() user: UserContextDto): Promise<Nullable<MeViewDto>> {
        if (user) {
            return this.authQueryRepository.me(user.id!);
        } else {
            return {
                login: 'anonymous',
                userId: null,
                email: null,
                firstName: null,
                lastName: null
            };
        }
    }*/
}
