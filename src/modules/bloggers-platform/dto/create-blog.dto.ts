export class CreateBlogDto {
    name: string;
    description: string;
    websiteUrl: string;
}

export class UpdateBlogDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
}
