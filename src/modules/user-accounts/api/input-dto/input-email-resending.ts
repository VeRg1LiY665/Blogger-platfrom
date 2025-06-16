import { IsEmail, IsString } from 'class-validator';

export class InputEmailResendingDto {
    @IsString()
    @IsEmail()
    email: string;
}
