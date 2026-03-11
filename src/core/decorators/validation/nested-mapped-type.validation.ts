import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import { TopUsersSortBy, TopUsersSortByParams } from '../../../modules/quiz-game/api/input-dto/top-users-sort-by';
import { SortDirection } from '../../dto/base.query-params.input-dto';

@ValidatorConstraint({ async: false })
export class MappedTypeConstraint implements ValidatorConstraintInterface {
    validate(value: TopUsersSortBy, validationArguments?: ValidationArguments): boolean {
        //if (!value) return true;

        if (typeof value !== 'object') return false; //можно и выкинуть - есть декоратор для этого

        const keys = Object.keys(value);

        if (keys.length === 0) return true;

        for (const key of keys) {
            if (!Object.values(TopUsersSortByParams).includes(key as TopUsersSortByParams)) {
                return false;
            }

            if (!Object.values(SortDirection).includes(value[key] as SortDirection)) {
                return false;
            }
        }

        return true;
    }
    defaultMessage() {
        return 'Wrong query params';
    }
}

export function IsValidMappedType(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: MappedTypeConstraint
        });
    };
}
