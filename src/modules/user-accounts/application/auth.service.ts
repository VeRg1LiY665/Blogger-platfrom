import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private jwtService: JwtService,
        private cryptoService: CryptoService
    ) {}
    async validateUser(loginOrEmail: string, password: string): Promise<UserContextDto | null> {
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

        if (!user) {
            return null;
        }

        const isPasswordValid = await this.cryptoService.comparePasswords({
            password,
            hash: user.passwordHash
        });

        if (!isPasswordValid) {
            return null;
        }

        return { id: user._id.toString() };
    }

    async login(userId: string) {
        const accessToken = this.jwtService.sign(
            { id: userId },
            {
                secret: 'kjsjhd67t43b9v',
                expiresIn: 10000 //10 min in ms
            }
        );

        return {
            accessToken
        };
    }
}
