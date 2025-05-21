import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, CommentModeltype } from '../domain/comment.entity';

export class CommentsRepository {
    constructor(@InjectModel(Comment.name) private commentModel: CommentModeltype) {}

    async findById(id: string): Promise<CommentDocument | null> {
        const result = await this.commentModel.findOne({
            _id: id
        });

        return result;
    }

    async save(comment: CommentDocument): Promise<void> {
        await comment.save();
    }

    async delete(id: string): Promise<void> {
        //TODO Soft delete?
        await this.commentModel.deleteOne({
            _id: id
        });

        return;
    }
}
