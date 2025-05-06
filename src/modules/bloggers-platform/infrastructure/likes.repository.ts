import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';

export class LikesRepo {
    onstructor(@InjectModel(Like.name) private likeModel: LikeModelType) {}
    async ShowReactionForComment(userId:string, parentId:string, commentId:string) {
        const res = await LikesModel
            .findOne({
                $and:[
                    {parentId: parentId},
                    {commentId: commentId}]
            })
            .lean()
        return res;
    }

    async CreateLikeEntity (like:LikesDBType) {
        const res = await LikesModel.insertOne(like)
        return res._id.toString();
    }

    async UpdateLikeEntity (like:LikesDBType) {
        const res = await LikesModel.updateOne(
            {_id: like._id},
            {$set:{...like}}
        )
        return res.matchedCount === 1;
    }

    async CountReactionsForComment(userId:string, parentId:string, commentId:string) {
        const likes = await LikesModel.countDocuments(
            {$and:[
                    {userId : userId},  //TODO проверить работу без userId
                    {commentId : commentId},
                    {status: 'Like'}
                ]}
        )

        const dislikes = await LikesModel.countDocuments(
            {$and:[
                    {userId : userId},
                    {commentId : commentId},
                    {status: 'Dislike'}
                ]}
        )

        return {likes, dislikes};
    }

    async ShowReactionForPost(parentId:string, postId:string) {
        const res = await LikesModel
            .findOne({
                $and:[
                    {parentId: parentId},
                    {postId: postId}]
            })
            .lean()
        return res;
    }

    async CountReactionsForPost(postId:string) {
        const likes = await LikesModel.countDocuments(
            {$and:[
                    {postId : postId},
                    {status: 'Like'}
                ]}
        )

        const dislikes = await LikesModel.countDocuments(
            {$and:[
                    {postId : postId},
                    {status: 'Dislike'}
                ]}
        )

        return {likes, dislikes};
    }

    async ShowLastReactionsForPost(postId:string) {

        const res = await LikesModel
            .find({
                $and:[
                    {postId:postId},
                    {status: 'Like'}
                ]}
            )
            .sort({['addedAt'] : -1})
            .limit(3)
            .lean()

        return res
    }
}