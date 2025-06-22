import { IsEmail } from 'class-validator';

export class UpdateUserInputDto {
    @IsEmail()
    email: string;
}
