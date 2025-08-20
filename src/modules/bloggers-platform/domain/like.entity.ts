import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    likeStatus: string;

    @Column()
    userId: string;

    @Column()
    parentId: string;

    @Column()
    commentId: string;

    @Column()
    postId: string;

    @Column()
    addedAt: string;

    static createInstance(dto: CreateLikeDomainDto): Like {
        const like = new this();
        like.likeStatus = dto.status;
        like.userId = dto.userId;
        like.parentId = dto.parentId;
        like.commentId = dto.commentId;
        like.postId = dto.postId;
        like.addedAt = new Date().toISOString();
        return like;
    }

    update(dto: UpdateLikeDomainDto) {
        this.likeStatus = dto.likeStatus;
    }
}
