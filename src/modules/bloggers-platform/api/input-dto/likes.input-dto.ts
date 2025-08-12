import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

enum LikeInput {
    Like = 'Like',
    Dislike = 'Dislike',
    None = 'None'
}

export class LikeInputDto {
    @IsString()
    @Trim()
    @IsNotEmpty()
    @IsEnum(LikeInput)
    likeStatus: string;
}
