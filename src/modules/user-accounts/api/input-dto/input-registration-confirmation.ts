import { IsString, IsUUID } from 'class-validator';

export class InputConfirmEmailDto {
    @IsString()
    @IsUUID()
    code: string;
}
