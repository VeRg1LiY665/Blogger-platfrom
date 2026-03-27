import { LikesInfo } from './likesInfo.schema';
import { CommentatorInfo } from './commentatorInfo.schema';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDto } from './dto/update-comment.domain.dto';
import { AfterLoad, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Like } from './like.entity';
import { LikeInput } from '../api/input-dto/likes.input-dto';

@Entity({ name: 'comments' })
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column(() => CommentatorInfo)
    commentatorInfo: CommentatorInfo;

    @Column()
    postId: string;

    @Column()
    createdAt: string;

    @OneToMany(() => Like, (like) => like.comment, { cascade: true })
    likes: Like[];

    @Column(() => LikesInfo)
    likesInfo: LikesInfo;

    @AfterLoad()
    createLikeStatus() {
        this.likesInfo.myStatus = LikeInput.None; //Как бы не особо правильно дергать апи слой в домене, но пока так
    }

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
