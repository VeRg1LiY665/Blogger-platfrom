import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from './post.entity';

@Entity({ name: 'likes' })
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    likeStatus: string;

    @Column()
    parentId: string;

    @ManyToOne(() => Comment, (comment) => comment.likes)
    @JoinColumn({ name: 'commentId' })
    comment: Comment;

    @Column({ nullable: true })
    commentId: string | null;

    @ManyToOne(() => Post, (post) => post.likes)
    @JoinColumn({ name: 'postId' })
    post: Post;

    @Column({ nullable: true })
    postId: string | null;

    @Column()
    addedAt: Date;

    static createInstance(dto: CreateLikeDomainDto): Like {
        const like = new this();
        like.likeStatus = dto.status;
        like.parentId = dto.parentId;
        like.commentId = dto.commentId;
        like.postId = dto.postId;
        like.addedAt = new Date();
        return like;
    }

    update(dto: UpdateLikeDomainDto) {
        this.likeStatus = dto.likeStatus;
    }
}
