import { BlogDocument } from '../../domain/blog.entity';

export class BlogViewDTO {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;

    static mapToView(blog: BlogDocument): BlogViewDTO {
        const dto = new BlogViewDTO();

        dto.id = blog._id.toString();
        dto.name = blog.name;
        dto.description = blog.description;
        dto.websiteUrl = blog.websiteUrl;
        dto.isMembership = blog.isMembership;
        dto.createdAt = blog.createdAt;

        return dto;
    }
}
