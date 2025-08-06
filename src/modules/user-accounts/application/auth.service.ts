import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';

@Injectable()
export class AuthService {
    constructor(
        private usersSqlRepository: UsersSqlRepository,
        private cryptoService: CryptoService
    ) {}
    async validateUser(loginOrEmail: string, password: string): Promise<UserContextDto | null> {
        const user = await this.usersSqlRepository.findByLoginOrEmail(loginOrEmail);

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

        return { id: user.id.toString() };
    }
}
