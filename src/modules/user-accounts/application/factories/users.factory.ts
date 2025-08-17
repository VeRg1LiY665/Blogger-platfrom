import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto.service';
import { User, UserDocument } from '../../domain/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class UsersFactory {
    // ❌ passwordHash: string; ни в коем случае не шарим состояние между методов через св-ва объекта (сервиса, юзкейса, квери, репозитория)
    // потому что синглтон, между разными запросами может быть перезапись данных

    constructor(private readonly cryptoService: CryptoService) {}
    async create(dto: CreateUserDto): Promise<User> {
        const passwordHash = await this.createPasswordHash(dto);
        const user: User = this.createUserInstance(dto, passwordHash);

        return user;
    }

    private async createPasswordHash(dto: CreateUserDto) {
        const passwordHash = await this.cryptoService.createPasswordHash(dto.password);
        return passwordHash;
    }

    private createUserInstance(dto: CreateUserDto, passwordHash: string) {
        const user: UserDocument = User.createInstance({
            email: dto.email,
            login: dto.login,
            passwordHash: passwordHash
        });
        return user;
    }
}
