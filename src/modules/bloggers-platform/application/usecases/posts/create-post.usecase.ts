import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CreatePostDto } from '../../../dto/create-post.dto';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';
import { Post } from '../../../domain/post.entity';

export class CreatePostCommand {
    constructor(public dto: CreatePostDto) {}
}

/**
 * Создание админом поста через админскую панель
 */

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, string> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private blogsSqlRepository: BlogsSqlRepository
    ) {}

    async execute({ dto }: CreatePostCommand): Promise<string> {
        const blog = await this.blogsSqlRepository.findById(dto.blogId);
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
            blogId: dto.blogId,
            blogName: blog.name
        });
        const id: string = await this.postsSqlRepository.save(newPost);

        return id;
    }
}
