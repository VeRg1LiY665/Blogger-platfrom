import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class UsersSqlQueryRepository {
    private users: Repository<User>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.users = this.dataSource.getRepository(User);
    }

    async findAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        const filter = {};
        if (query.searchLoginTerm !== null) {
            filter['login'] = '%' + query.searchLoginTerm + '%';
        }
        if (query.searchEmailTerm !== null) {
            filter['email'] = '%' + query.searchEmailTerm + '%';
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    return `u.${condition} ILIKE :${condition}`;
                })
                .join(' OR ');
            whereClause = conditions;
        }

        const queryBuilder = this.users
            .createQueryBuilder('u')
            .select(['u.id as "id"', 'u.login as "login"', 'u.email as "email"', 'u.createdAt as "createdAt"'])
            .where(whereClause, { ...filter })
            .orderBy(`u."${query.sortBy}"`, query.sortDirection);

        const users = await queryBuilder.take(query.pageSize).skip(query.calculateSkip()).getRawMany();

        const totalCount: number = +(await queryBuilder.getCount());

        const items = users.map((x) => UserViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<UserViewDto | null> {
        const user = await this.users
            .createQueryBuilder('u')
            .select(['u.id as "id"', 'u.login as "login"', 'u.email as "email"', 'u.createdAt as "createdAt"'])
            .where('u.id = :id', { id: +id })
            .getRawOne();

        return user ? UserViewDto.mapSqlToView(user) : null;
    }
}
