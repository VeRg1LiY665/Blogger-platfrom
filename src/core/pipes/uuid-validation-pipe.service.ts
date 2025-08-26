import { Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
    transform(value: string): any {
        if (isUUID(value)) {
            return value;
        }
        //TODO НУЖНО ДЛЯ ТЕСТОВ - Убрать это потом нафиг/использовать класс валидатор/заменить ошибку на 400
        throw new DomainException({
            code: DomainExceptionCode.NotFound,
            message: `Invalid UUID format: ${value}`
        });
    }
}
