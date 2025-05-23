import { UserDocument } from '../../../domain/user.entity';

export class UserExternalDto {
    userId: string;
    login: string;
    email: string;
    createdAt: string;

    static mapToView(user: UserDocument): UserExternalDto {
        const dto = new UserExternalDto();

        dto.userId = user._id.toString();
        dto.login = user.login;
        dto.email = user.email;
        dto.createdAt = user.createdAt.toISOString();

        return dto;
    }
}
