import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/post.entity';

export class PostsExtRepository {
    constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

    async findById(id: string): Promise<PostDocument | null> {
        const result = await this.postModel.findOne({
            _id: id
        });

        return result;
    }

    async save(post: PostDocument): Promise<void> {
        await post.save();
    }
}
