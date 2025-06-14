import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { DomainException, Extension } from '../core/exceptions/domain-exceptions';
import { ObjectIdValidationTransformationPipe } from '../core/pipes/object-id-validation-transformation-pipe.service';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';

//функция использует рекурсию для обхода объекта children при вложенных полях при валидации
//поставьте логи и разберитесь как она работает
//TODO: tests
export const errorFormatter = (errors: ValidationError[], errorMessage?: any): Extension[] => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const errorsForResponse = errorMessage || [];

    for (const error of errors) {
        if (!error.constraints && error.children?.length) {
            errorFormatter(error.children, errorsForResponse);
        } else if (error.constraints) {
            const constrainKeys = Object.keys(error.constraints);

            for (const key of constrainKeys) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                errorsForResponse.push({
                    message: error.constraints[key] ? `${error.constraints[key]}; Received value: ${error?.value}` : '',
                    key: error.property
                });
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
    //Глобальный пайп для валидации и трансформации входящих данных.
    app.useGlobalPipes(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call
        new ObjectIdValidationTransformationPipe(),
        new ValidationPipe({
            //class-transformer создает экземпляр dto
            //соответственно применятся значения по-умолчанию
            //и методы классов dto
            transform: true,

            whitelist: true,
            //Выдавать первую ошибку для каждого поля
            stopAtFirstError: true,
            //Для преобразования ошибок класс валидатора в необходимый вид
            exceptionFactory: (errors) => {
                const formattedErrors = errorFormatter(errors);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                throw new DomainException({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                    code: DomainExceptionCode.ValidationError,
                    message: 'Validation failed',
                    extensions: formattedErrors
                });
            }
        })
    );
}
