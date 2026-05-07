import { Blog } from '../../domain/blog.entity';
import { ApiProperty } from '@nestjs/swagger';

export class BlogViewDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    websiteUrl: string;
    @ApiProperty()
    createdAt: string;
    @ApiProperty()
    isMembership: boolean;

    static mapSqlToView(blog: Blog): BlogViewDto {
        const dto = new BlogViewDto();

        dto.id = blog.id.toString();
        dto.name = blog.name;
        dto.description = blog.description;
        dto.websiteUrl = blog.websiteUrl;
        dto.isMembership = blog.isMembership;
        dto.createdAt = blog.createdAt;

        return dto;
    }
}
