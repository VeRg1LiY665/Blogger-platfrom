import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class LogoutUserCommand {
    constructor(public userId: string) {}
}

/**
 * Logout пользователя
 */
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand, void> {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType, //Зачем?
        private jwtService: JwtService
    ) {}

    async execute({ userId }: LogoutUserCommand): Promise<void> {}
}
