import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

//этот гард вешаем на логин. Через локальную стратегию проверяются логин и пароль пользователя
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    constructor(private readonly localStrategy: LocalStrategy) {
        super();
    }
}
