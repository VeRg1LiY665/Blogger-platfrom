import { IsString, IsUrl, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class BlogsInputUpdateDto {
    @IsString()
    @Trim()
    @Length(1, 15)
    name: string;

    @IsString()
    @Trim()
    @Length(1, 500)
    description: string;

    @Trim()
    @IsString()
    @IsUrl()
    websiteUrl: string;
}
