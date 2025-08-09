import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UpdateBlogPostDto } from '../../../dto/update-blog-post.dto';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';

export class UpdateBlogPostCommand {
    constructor(
        public blogId: string,
        public postId: string,
        public dto: UpdateBlogPostDto
    ) {}
}

/**
 * Создание админом блога через админскую панель
 */

@CommandHandler(UpdateBlogPostCommand)
export class UpdateBlogPostUseCase implements ICommandHandler<UpdateBlogPostCommand, void> {
    constructor(
        private blogsSqlRepository: BlogsSqlRepository,
        private postsSqlRepository: PostsSqlRepository
    ) {}

    async execute({ blogId, postId, dto }: UpdateBlogPostCommand): Promise<void> {
        const blog = await this.blogsSqlRepository.findById(blogId);

        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        const post = await this.postsSqlRepository.findById(postId);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        const postUpdateDto = { ...dto, blogId: blogId, blogName: blog.name };
        post.update(postUpdateDto);

        await this.postsSqlRepository.save(post);

        return;
    }
}
