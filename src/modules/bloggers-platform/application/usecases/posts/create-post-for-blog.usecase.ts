import { CreateBlogPostDto } from '../../../dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Post } from '../../../domain/post.entity';

export class CreatePostForBlogCommand {
    constructor(
        public blogId: string,
        public dto: CreateBlogPostDto
    ) {}
}

/**
 * Создание админом поста через админскую панель
 */

@CommandHandler(CreatePostForBlogCommand)
export class CreateBlogPostUseCase implements ICommandHandler<CreatePostForBlogCommand, string> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private blogsSqlRepository: BlogsSqlRepository
    ) {}

    async execute({ blogId, dto }: CreatePostForBlogCommand): Promise<string> {
        const blog = await this.blogsSqlRepository.findById(blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        const newPost = Post.createInstance({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: blogId,
            blogName: blog.name
        });
        const id: string = await this.postsSqlRepository.save(newPost);

        return id;
    }
}
