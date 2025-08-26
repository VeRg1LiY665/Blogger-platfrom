import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { ExtendedLikesInfo } from './extendedLikesInfo.schema';
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Like } from './like.entity';
import { Blog } from './blog.entity';

@Entity({ name: 'posts' })
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    shortDescription: string;

    @Column()
    content: string;

    @ManyToOne(() => Blog, (blog) => blog.posts)
    @JoinColumn({ name: 'blogId' })
    blog: Blog;

    @Column()
    blogId: string;

    @Column()
    blogName: string;

    @Column()
    createdAt: string;

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

    @Column({ default: 0 })
    likesCount: number;

    @Column({ default: 0 })
    dislikesCount: number;

    @Column(() => ExtendedLikesInfo)
    extendedLikesInfo: ExtendedLikesInfo;

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
