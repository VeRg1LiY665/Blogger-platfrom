import { Injectable, PipeTransform } from '@nestjs/common';
import { isNumber, isUUID } from 'class-validator';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
    transform(value: string): any {
        if (isUUID(value)) {
            return value;
        }

        if (isNumber(+value)) {
            //Это только для тестов, чтобы не менять тип id на number
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: `Invalid UUID format: ${value}`
            });
        }

        throw new DomainException({
            code: DomainExceptionCode.BadRequest,
            message: `Invalid UUID format: ${value}`
        });
    }
}
