import { UserDocument } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: string;

    static mapToView(user: UserDocument): UserViewDto {
        const dto = new UserViewDto();

        dto.id = user._id.toString();
        dto.login = user.login;
        dto.email = user.email;
        dto.createdAt = user.createdAt.toISOString();

        return dto;
    }

    static mapSqlToView(rows: any): UserViewDto {
        //TODO Create type?
        const dto = new UserViewDto();
        dto.id = rows.id.toString();
        dto.login = rows.login;
        dto.email = rows.email;
        dto.createdAt = rows.createdAt;

        return dto;
    }
}
export class MeViewDto extends OmitType(UserViewDto, ['createdAt', 'id'] as const) {
    userId: string;

    static mapToView(user: UserDocument): MeViewDto {
        const dto = new MeViewDto();

        dto.email = user.email;
        dto.login = user.login;
        dto.userId = user._id.toString();

        return dto;
    }

    static mapSqlToView(rows: any): MeViewDto {
        const dto = new MeViewDto();

        dto.email = rows.email;
        dto.login = rows.login;
        dto.userId = rows.id.toString();

        return dto;
    }
}
