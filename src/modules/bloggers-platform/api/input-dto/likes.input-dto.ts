import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class LikeInputDto {
    @IsString()
    @Trim()
    @IsNotEmpty()
    likeStatus: string;
}
