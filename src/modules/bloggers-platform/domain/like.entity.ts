import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';

@Schema()
export class Like {
    id: number;

    likeStatus: string;

    userId: string;

    parentId: string;

    commentId: string;

    postId: string;

    addedAt: string;

    static createInstance(dto: CreateLikeDomainDto): LikeDocument {
        const like = new this();
        like.likeStatus = dto.status;
        like.userId = dto.userId;
        like.parentId = dto.parentId;
        like.commentId = dto.commentId;
        like.postId = dto.postId;
        like.addedAt = new Date().toISOString();
        return like as LikeDocument;
    }

    update(dto: UpdateLikeDomainDto) {
        this.likeStatus = dto.likeStatus;
    }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
