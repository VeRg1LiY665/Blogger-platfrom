import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Question } from '../domain/question.entity';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetQuestionsQueryParams } from '../api/input-dto/get-questions-query-params.input-dto';
import { QuestionViewDto } from '../api/view-dto/questions.view-dto';

@Injectable()
export class QuestionsSqlQRepository {
    private questions: Repository<Question>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.questions = this.dataSource.getRepository(Question);
    }

    async findAll(query: GetQuestionsQueryParams): Promise<PaginatedViewDto<QuestionViewDto[]>> {
        const filter = {};

        if (query.bodySearchTerm) {
            filter['body'] = '%' + query.bodySearchTerm + '%';
        }

        if (query.publishedStatus) {
            filter['published'] = true;
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    if (condition == 'published') {
                        return `b.${condition} = :${condition}`;
                    }
                    return `b.${condition} ILIKE :${condition}`;
                })
                .join(' OR ');
            whereClause = conditions;
        }
        const queryBuilder = this.questions
            .createQueryBuilder('b')
            .select('b.*')
            .where(whereClause, { ...filter })
            .orderBy(`b."${query.sortBy}"`, query.sortDirection);

        const questions = await queryBuilder.take(query.pageSize).skip(query.calculateSkip()).getRawMany();

        const totalCount: number = +(await queryBuilder.getCount());

        const items = questions.map((x: Question) => QuestionViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<QuestionViewDto | null> {
        const question = await this.questions
            .createQueryBuilder('b')
            .select('b.*')
            .where('b.id = :id', { id: id })
            .getRawOne();

        return question ? QuestionViewDto.mapSqlToView(question) : null;
    }
}
