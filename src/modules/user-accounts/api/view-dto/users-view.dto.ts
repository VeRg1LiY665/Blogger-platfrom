import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: string;

    static mapSqlToView(rows: any): UserViewDto {
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

    static mapSqlToView(rows: any): MeViewDto {
        const dto = new MeViewDto();

        dto.email = rows.email;
        dto.login = rows.login;
        dto.userId = rows.id.toString();

        return dto;
    }
}
