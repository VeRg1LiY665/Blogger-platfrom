import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDto } from '../dto/create-blog.dto';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'blogs' })
export class Blog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    websiteUrl: string;

    @Column()
    createdAt: string;

    @Column()
    isMembership: boolean;

    @OneToMany(() => Post, (post) => post.blog, { cascade: true })
    posts: Post[];

    static createInstance(dto: CreateBlogDomainDto): Blog {
        const blog = new this();
        blog.name = dto.name;
        blog.description = dto.description;
        blog.websiteUrl = dto.websiteUrl;
        blog.createdAt = new Date().toISOString();
        blog.isMembership = false;
        return blog;
    }

    update(dto: UpdateBlogDto) {
        this.name = dto.name;
        this.description = dto.description;
        this.websiteUrl = dto.websiteUrl;
    }
}
