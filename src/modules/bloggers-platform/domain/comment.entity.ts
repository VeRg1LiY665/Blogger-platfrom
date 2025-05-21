import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { likesInfo } from './likesInfo.schema';
import { commentatorInfo, commentatorInfoSchema } from './commentatorInfo.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDto } from './dto/update-comment.domain.dto';

@Schema()
export class Comment {
    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: commentatorInfoSchema, required: true })
    commentatorInfo: commentatorInfo;

    @Prop({ required: true })
    postId: string;

    @Prop({ required: true })
    createdAt: string;

    @Prop({ type: likesInfo, required: true })
    likesInfo: likesInfo;

    static createInstance(dto: CreateCommentDomainDto): CommentDocument {
        const comment = new this();
        comment.content = dto.content;
        comment.commentatorInfo = dto.commentatorInfo;
        comment.postId = dto.postId;
        comment.createdAt = new Date().toISOString();
        //comment.likesInfo = dto.likesInfo;
        return comment as CommentDocument;
    }

    update(dto: UpdateCommentDomainDto) {
        this.content = dto.content;
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModeltype = Model<CommentDocument> & typeof Comment;
