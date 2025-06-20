import { Trim } from '../../../../core/decorators/transform/trim';
import { IsString, Length } from 'class-validator';

export class CreateCommentInputDto {
    @IsString()
    @Trim()
    @Length(20, 300)
    content: string;
}
