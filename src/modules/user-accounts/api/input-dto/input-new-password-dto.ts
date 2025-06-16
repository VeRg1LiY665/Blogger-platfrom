import { IsString, IsUUID, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';

export class InputNewPasswordDto {
    @IsString()
    @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
    @Trim()
    newPassword: string;

    @IsUUID()
    code: string;
}
