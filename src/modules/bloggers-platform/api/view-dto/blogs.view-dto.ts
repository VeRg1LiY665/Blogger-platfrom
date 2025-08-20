import { Blog } from '../../domain/blog.entity';

export class BlogViewDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
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
