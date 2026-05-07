import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../dto/base.paginated.view-dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(PaginatedViewDto, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatedViewDto) },
                    {
                        properties: {
                            items: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) }
                            }
                        }
                    }
                ]
            }
        })
    );
};
