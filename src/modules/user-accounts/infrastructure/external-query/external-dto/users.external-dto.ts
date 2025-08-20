import { User } from '../../../domain/user.entity';

export class UserExternalDto {
    userId: string;
    login: string;
    email: string;
    createdAt: string;

    static mapSqlToView(user: User): UserExternalDto {
        const dto = new UserExternalDto();

        dto.userId = user.id.toString();
        dto.login = user.login;
        dto.email = user.email;
        dto.createdAt = user.createdAt.toISOString();

        return dto;
    }
}
