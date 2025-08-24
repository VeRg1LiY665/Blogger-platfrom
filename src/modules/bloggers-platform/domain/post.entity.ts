import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { ExtendedLikesInfo } from './extendedLikesInfo.schema';
import { AfterLoad, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'posts' })
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

    @Column({ default: 0 })
    likesCount: number;

    @Column({ default: 0 })
    dislikesCount: number;

    extendedLikesInfo: ExtendedLikesInfo;

    @AfterLoad() //TODO Уточнить по поводу этого декоратора в данном контексте
    createExtLikesInfo() {
        this.extendedLikesInfo = new ExtendedLikesInfo();
    }

    static createInstance(dto: CreatePostDomainDto): Post {
        const post = new this();
        post.title = dto.title;
        post.shortDescription = dto.shortDescription;
        post.content = dto.content;
        post.createdAt = new Date().toISOString();
        post.blogId = dto.blogId;
        post.blogName = dto.blogName;
        post.extendedLikesInfo = new ExtendedLikesInfo();
        return post;
    }

    update(dto: UpdatePostDomainDto) {
        this.title = dto.title;
        this.shortDescription = dto.shortDescription;
        this.content = dto.content;
        this.blogId = dto.blogId;
    }
}
