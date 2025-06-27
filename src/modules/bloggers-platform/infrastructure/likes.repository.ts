import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, LikeModelType } from '../domain/like.entity';

export class LikesRepo {
    constructor(@InjectModel(Like.name) private likeModel: LikeModelType) {}

    async ShowReactionForComment(parentId: string, commentId: string) {
        const res = await this.likeModel.findOne({
            $and: [{ parentId: parentId }, { commentId: commentId }]
        });

        return res;
    }

    async save(like: LikeDocument) {
        await like.save();
    }

    async CountReactionsForComment(commentId: string) {
        const likes = await this.likeModel.countDocuments({
            $and: [{ commentId: commentId }, { likeStatus: 'Like' }]
        });

        const dislikes = await this.likeModel.countDocuments({
            $and: [{ commentId: commentId }, { likeStatus: 'Dislike' }]
        });

        return { likes, dislikes };
    }

    async ShowReactionForPost(parentId: string, postId: string) {
        const res = await this.likeModel.findOne({
            $and: [{ parentId: parentId }, { postId: postId }]
        });

        return res;
    }

    async CountReactionsForPost(postId: string) {
        const likes = await this.likeModel.countDocuments({ $and: [{ postId: postId }, { likeStatus: 'Like' }] });

        const dislikes = await this.likeModel.countDocuments({ $and: [{ postId: postId }, { likeStatus: 'Dislike' }] });

        return { likes, dislikes };
    }

    async ShowLastLikesForPost(postId: string) {
        const res = await this.likeModel
            .find({
                $and: [{ postId: postId }, { likeStatus: 'Like' }] //This shall return ONLY last likes e.g. likestatus="Like"
            })
            .sort({ ['addedAt']: -1 })
            .limit(3);

        return res;
    }
}
