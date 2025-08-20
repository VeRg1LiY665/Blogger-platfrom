import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { extendedLikesInfo } from './extendedLikesInfo.schema';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    shortDescription: string;

    @Column()
    content: string;

    @Column()
    blogId: string;

    @Column()
    blogName: string;

    @Column()
    createdAt: string;

    @Column()
    extendedLikesInfo: extendedLikesInfo;

    static createInstance(dto: CreatePostDomainDto): Post {
        const post = new this();
        post.title = dto.title;
        post.shortDescription = dto.shortDescription;
        post.content = dto.content;
        post.createdAt = new Date().toISOString();
        post.blogId = dto.blogId;
        post.blogName = dto.blogName;
        post.extendedLikesInfo = new extendedLikesInfo();
        return post;
    }

    update(dto: UpdatePostDomainDto) {
        this.title = dto.title;
        this.shortDescription = dto.shortDescription;
        this.content = dto.content;
        this.blogId = dto.blogId;
    }
}
