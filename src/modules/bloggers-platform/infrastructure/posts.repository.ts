import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType, PostDocument } from '../domain/post.entity';

export class PostsRepository {
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

    async delete(id: string): Promise<void> {
        //TODO Soft delete?
        await this.postModel.deleteOne({
            _id: id
        });

        return;
    }
}
