import { User } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable({ scope: Scope.REQUEST }) //Create repo/request to share the state between the methods within one request
export class UsersSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: User | null = null; //stores the state of the entity got from the db

    private dataMapper(userData: any): User {
        const user = new User();
        user.id = userData.id;
        user.email = userData.email;
        user.login = userData.login;
        user.passwordHash = userData.passwordHash;
        user.createdAt = new Date(userData.createdAt as string);
        user.emailConfirmation = {
            confirmationCode: userData.emailConfirmation.confirmationCode,
            expirationDate: new Date(userData.emailConfirmation.expirationDate as string),
            isConfirmed: userData.emailConfirmation.isConfirmed
        };
        user.passwordRecovery = {
            expirationDate: new Date(userData.passwordRecovery.expirationDate as string),
            recoveryCode: userData.passwordRecovery.recoveryCode
        };
        this.entity = JSON.parse(JSON.stringify(user)); //save the state of the data through deep copy

        return user;
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.pool.query(
            `SELECT u.id,
                    u.login,
                    u."passwordHash",
                    u.email,
                    u."createdAt",
                    (SELECT json_build_object('confirmationCode', e."confirmationCode", 'expirationDate',
                                              e."expirationDate", 'isConfirmed', e."isConfirmed")
                     FROM "emailConfirmation" e
                     WHERE e."userId" = u.id) as "emailConfirmation",
                    (SELECT json_build_object('recoveryCode', p."recoveryCode", 'expirationDate', p."expirationDate")
                     FROM "passwordRecovery" p
                     WHERE p."userId" = u.id) as "passwordRecovery"
             FROM users u
             WHERE id = $1`,
            [id]
        );

        return user.rows.length > 0 ? this.dataMapper(user.rows[0]) : null;
    }

    async findByLoginOrEmail(searchData: string): Promise<User | null> {
        const filter = {};

        switch (true) {
            case searchData.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null:
                filter['email'] = searchData;
                break;
            default:
                filter['login'] = searchData;
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `${condition} LIKE $${i + 1}`;
                })
                .toString();
            whereClause = `WHERE ${conditions}`;
        }

        const user = await this.pool.query(
            `
                SELECT u.id,
                       u.login,
                       u."passwordHash",
                       u.email,
                       u."createdAt",
                       (SELECT json_build_object('confirmationCode', e."confirmationCode", 'expirationDate',
                                                 e."expirationDate", 'isConfirmed', e."isConfirmed")
                        FROM "emailConfirmation" e
                        WHERE e."userId" = u.id) as "emailConfirmation",
                       (SELECT json_build_object('recoveryCode', p."recoveryCode", 'expirationDate', p."expirationDate")
                        FROM "passwordRecovery" p
                        WHERE p."userId" = u.id) as "passwordRecovery"
                FROM users u
                ${whereClause}`,
            [...Object.values(filter)]
        );

        if (user.rows.length < 1) {
            return null;
        }
        return this.dataMapper(user.rows[0]);
    }

    async findOrNotFoundFail(id: string): Promise<User> {
        const user = await this.findById(id);

        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        return user;
    }

    async findByUUID(uuid: string): Promise<User | null> {
        const filter = {};

        switch (true) {
            case uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null:
                filter['confirmationCode'] = uuid; //emailConfirmation
                break;
            case uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-rq$/) !== null:
                filter['recoveryCode'] = uuid; //passwordRecovery
                break;
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `"${condition}" LIKE $${i + 1}`;
                })
                .toString();
            whereClause = `WHERE ${conditions}`;
        }

        let result: any; //type?
        switch (true) {
            case Object.keys(filter)[0] == 'confirmationCode':
                result = await this.pool.query(
                    `SELECT u.id,
                            u.login,
                            u."passwordHash",
                            u.email,
                            u."createdAt",
                            (SELECT json_build_object('confirmationCode', e."confirmationCode", 'expirationDate',
                                                      e."expirationDate", 'isConfirmed', e."isConfirmed")
                             FROM "emailConfirmation" e
                             WHERE e."userId" = u.id) as "emailConfirmation",
                            (SELECT json_build_object('recoveryCode', p."recoveryCode", 'expirationDate',
                                                      p."expirationDate")
                             FROM "passwordRecovery" p
                             WHERE p."userId" = u.id) as "passwordRecovery"
                     FROM users u
                     WHERE id IN (SELECT "userId" FROM "emailConfirmation" ${whereClause})`,
                    [...Object.values(filter)]
                );
                break;
            case Object.keys(filter)[0] == 'recoveryCode':
                result = await this.pool.query(
                    `SELECT u.id,
                            u.login,
                            u."passwordHash",
                            u.email,
                            u."createdAt",
                            (SELECT json_build_object('confirmationCode', e."confirmationCode", 'expirationDate',
                                                      e."expirationDate", 'isConfirmed', e."isConfirmed")
                             FROM "emailConfirmation" e
                             WHERE e."userId" = u.id) as "emailConfirmation",
                            (SELECT json_build_object('recoveryCode', p."recoveryCode", 'expirationDate',
                                                      p."expirationDate")
                             FROM "passwordRecovery" p
                             WHERE p."userId" = u.id) as "passwordRecovery"
                     FROM users u
                     WHERE id IN (SELECT "userId" FROM "passwordRecovery" ${whereClause})`,
                    [...Object.values(filter)]
                );
                break;
        }
        //const user = await this.pool.query(`SELECT "userId" FROM devices ${whereClause}`, [...Object.values(filter)]);

        /*const result = await this.pool.query(
            `SELECT * FROM users WHERE id IN (SELECT "userId" FROM devices ${whereClause}, [...Object.values(filter)])`
        );*/

        return result.rows.length > 0 ? this.dataMapper(result.rows[0]) : null;
    }

    async save(user: User): Promise<number> {
        //Get there unification with mongoose implementation
        //Check if any changes happened through the internal state of the repository class

        if (JSON.stringify(this.entity) === JSON.stringify(user) && this.entity !== null) {
            return this.entity.id;
        }

        if (JSON.stringify(this.entity) !== JSON.stringify(user) && this.entity !== null) {
            const res = await this.pool.query(
                'UPDATE users SET login = $1, "passwordHash" = $2, email = $3, "createdAt" = $4 WHERE id = $5 RETURNING id',
                [
                    user.login,
                    user.passwordHash,
                    user.email,
                    user.createdAt.toISOString() /*toLocaleString('en-US')*/,
                    user.id
                ]
            );

            await this.pool.query(
                'UPDATE "emailConfirmation" SET "confirmationCode" = $1, "expirationDate" = $2, "isConfirmed" = $3 WHERE "userId" = $4',
                [
                    user.emailConfirmation.confirmationCode,
                    user.emailConfirmation.expirationDate.toISOString(),
                    user.emailConfirmation.isConfirmed,
                    user.id
                ]
            );

            await this.pool.query(
                'UPDATE "passwordRecovery" SET "recoveryCode" = $1, "expirationDate" = $2 WHERE "userId" = $3',
                [user.passwordRecovery.recoveryCode, user.passwordRecovery.expirationDate.toISOString(), user.id]
            );

            const id = res.rows[0].id;
            return id;
        }

        const res = await this.pool.query(
            'INSERT INTO users (login, "passwordHash", email, "createdAt") VALUES ($1, $2, $3, $4) RETURNING id',
            [user.login, user.passwordHash, user.email, user.createdAt.toISOString() /*toLocaleString('en-US')*/]
        );
        const id = res.rows[0].id;

        await this.pool.query(
            'INSERT INTO "emailConfirmation" ("userId", "confirmationCode", "expirationDate", "isConfirmed") VALUES ($1, $2, $3, $4)',
            [
                id,
                user.emailConfirmation.confirmationCode,
                user.emailConfirmation.expirationDate.toISOString(),
                user.emailConfirmation.isConfirmed
            ]
        );

        await this.pool.query(
            'INSERT INTO "passwordRecovery" ("userId", "recoveryCode", "expirationDate") VALUES ($1, $2, $3)',
            [id, user.passwordRecovery.recoveryCode, user.passwordRecovery.expirationDate.toISOString()]
        );

        return id;
    }

    /*async update(user: User): Promise<number> {
        const res = await this.pool.query(
            'UPDATE users SET login = $1, "passwordHash" = $2, email = $3, "createdAt" = $4 WHERE id = ${user.id} RETURNING id',
            [user.login, user.passwordHash, user.email, user.createdAt.toLocaleString('en-US')]
        );

        if (Object.keys(user.emailConfirmation).length > 0) {
            //Checkup for object existence
            await this.pool.query(
                'UPDATE "emailConfirmation" SET "confiramtionCode" = $1, "expirationDate" = $2, "isConfirmed" = $3 WHERE "userId" = ${user.id}',
                [
                    user.emailConfirmation.confirmationCode,
                    user.emailConfirmation.expirationDate,
                    user.emailConfirmation.isConfirmed
                ]
            );
        }

        if (Object.keys(user.passwordRecovery).length > 0) {
            //Checkup for object existence
            await this.pool.query(
                'UPDATE "passwordRecovery" SET "recoveryCode" = $1, "expirationDate" = $2 WHERE "userId" = ${user.id}',
                [user.passwordRecovery.recoveryCode, user.passwordRecovery.expirationDate]
            );
        }
        const id = res.rows[0].id;
        return id;
    }*/

    async delete(userId: string): Promise<void> {
        await this.pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return;
    }
}
