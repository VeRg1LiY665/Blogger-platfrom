import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto.service';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class UsersFactory {
    // ❌ passwordHash: string; ни в коем случае не шарим состояние между методов через св-ва объекта (сервиса, юзкейса, квери, репозитория)
    // потому что синглтон, между разными запросами может быть перезапись данных

    constructor(
        private readonly cryptoService: CryptoService,
        @InjectModel(User.name)
        private userModel: UserModelType
    ) {}
    async create(dto: CreateUserDto): Promise<UserDocument> {
        const passwordHash = await this.createPasswordHash(dto);
        const user: UserDocument = this.createUserInstance(dto, passwordHash);

        return user as UserDocument;
    }

    private async createPasswordHash(dto: CreateUserDto) {
        const passwordHash = await this.cryptoService.createPasswordHash(dto.password);
        return passwordHash;
    }

    private createUserInstance(dto: CreateUserDto, passwordHash: string) {
        const user: UserDocument = this.userModel.createInstance({
            email: dto.email,
            login: dto.login,
            passwordHash: passwordHash
        });
        return user;
    }
}
