import { likesInfo } from './likesInfo.schema';
import { commentatorInfo } from './commentatorInfo.schema';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDto } from './dto/update-comment.domain.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    commentatorInfo: commentatorInfo;

    @Column()
    postId: string;

    @Column()
    createdAt: string;

    @Column()
    likesInfo: likesInfo;

    static createInstance(dto: CreateCommentDomainDto): Comment {
        const comment = new this();
        comment.content = dto.content;
        comment.commentatorInfo = dto.commentatorInfo;
        comment.postId = dto.postId;
        comment.createdAt = new Date().toISOString();
        comment.likesInfo = dto.likesInfo;
        return comment;
    }

    update(dto: UpdateCommentDomainDto) {
        this.content = dto.content;
    }
}
