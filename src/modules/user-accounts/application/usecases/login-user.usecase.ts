import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersFactory } from '../factories/users.factory';
import { EmailService } from '../../../notifications/email.service';
import { JwtService } from '@nestjs/jwt';

export class LoginUserCommand {
    constructor(public userId: string) {}
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
    implements ICommandHandler<LoginUserCommand, { accessToken: string; refreshToken: string }>
{
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType, //Зачем?
        private jwtService: JwtService
    ) {}

    async execute({ userId }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = this.jwtService.sign(
            { id: userId },
            {
                secret: 'kjsjhd67t43b9v',
                expiresIn: '10m' //10 min in ms //TODO разобраться как оверрайдить пров, если пропсы закидываю при вызове метода
            }
        );

        const refreshToken = this.jwtService.sign(
            { id: userId },
            {
                secret: 'pokjcleYm&hd93g1!',
                expiresIn: '24h' //24 hours in ms
            }
        );

        return {
            accessToken,
            refreshToken
        };
    }
}
