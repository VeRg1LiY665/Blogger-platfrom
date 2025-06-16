import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/CreateUserDomainDto';
import { emailConfirmation, emailConfirmationSchema } from './emailConfirmation.schema';
import { passwordRecovery, passwordRecoverySchema } from './passwordRecovery.schema';
import { UpdateUserDomainDto } from './dto/UpdateUserDomainDto';

export const loginConstraints = {
    minLength: 3,
    maxLength: 10
};

export const passwordConstraints = {
    minLength: 6,
    maxLength: 20
};

export const emailConstraints = {
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
};
//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class User {
    /**
     * Login of the user (must be uniq)
     * @type {string}
     * @required
     */
    @Prop({ type: String, required: true, unique: true, ...loginConstraints })
    login: string;

    /**
     * Password hash for authentication
     * @type {string}
     * @required
     */
    @Prop({ type: String, required: true })
    passwordHash: string;

    /**
     * Email of the user
     * @type {string}
     * @required
     */
    @Prop({ type: String, min: 5, required: true })
    email: string;

    /**
     * Creation timestamp
     * Explicitly defined despite timestamps: true
     * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
     * @type {Date}
     */
    createdAt: Date;

    @Prop({ type: emailConfirmationSchema, required: true })
    emailConfirmation: emailConfirmation;

    @Prop({ type: passwordRecoverySchema, required: true })
    passwordRecovery: passwordRecovery;

    /**
     * Factory method to create a User instance
     * @param {CreateUserDto} dto - The data transfer object for user creation
     * @returns {UserDocument} The created user document
     */
    static createInstance(dto: CreateUserDomainDto): UserDocument {
        const user = new this();
        user.email = dto.email;
        user.login = dto.login;
        user.passwordHash = dto.passwordHash;
        user.createdAt = new Date();
        user.emailConfirmation.confirmationCode = '';
        user.emailConfirmation.expirationDate = new Date();
        user.emailConfirmation.isConfirmed = false;
        user.passwordRecovery.expirationDate = new Date();
        user.passwordRecovery.recoveryCode = '';

        return user as UserDocument;
    }

    setConfirmationCode(code: string) {
        this.emailConfirmation.confirmationCode = code;
    }

    setRecoveryCode(recoveryCode: string, expirationDate: Date) {
        this.passwordRecovery.recoveryCode = recoveryCode;
        this.passwordRecovery.expirationDate = expirationDate;
    }

    /**
     * Updates the user instance with new data
     * Resets email confirmation if email is updated
     * @param {UpdateUserDomainDto} dto - The data transfer object for user updates
     * DDD сontinue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
     */
    update(dto: Partial<UpdateUserDomainDto>) {
        //чтобы можно было передавать только те свойства, которые сейчас нужны
        if (!!dto.email && dto.email !== this.email) {
            this.email = dto.email;
        }

        if (!!dto.login && dto.login !== this.login) {
            this.login = dto.login;
        }

        if (!!dto.passwordHash && dto.passwordHash !== this.passwordHash) {
            this.passwordHash = dto.passwordHash;
        }

        if (
            !!dto.passwordRecovery &&
            !!dto.passwordRecovery.recoveryCode &&
            dto.passwordRecovery.recoveryCode !== this.passwordRecovery.recoveryCode
        ) {
            this.passwordRecovery.recoveryCode = dto.passwordRecovery.recoveryCode;
        }

        if (
            !!dto.passwordRecovery &&
            !!dto.passwordRecovery.expirationDate &&
            dto.passwordRecovery.expirationDate !== this.passwordRecovery.expirationDate
        ) {
            this.passwordRecovery.expirationDate = dto.passwordRecovery.expirationDate;
        }

        if (
            !!dto.emailConfirmation &&
            !!dto.emailConfirmation.expirationDate &&
            dto.emailConfirmation.expirationDate !== this.emailConfirmation.expirationDate
        ) {
            this.emailConfirmation.expirationDate = dto.emailConfirmation.expirationDate;
        }

        if (
            !!dto.emailConfirmation &&
            dto.emailConfirmation.isConfirmed && // нет !! потому что и так буль
            dto.emailConfirmation.isConfirmed !== this.emailConfirmation.isConfirmed
        ) {
            this.emailConfirmation.isConfirmed = dto.emailConfirmation.isConfirmed;
        }

        if (
            !!dto.emailConfirmation &&
            !!dto.emailConfirmation.confirmationCode &&
            dto.emailConfirmation.confirmationCode !== this.emailConfirmation.confirmationCode
        ) {
            this.emailConfirmation.confirmationCode = dto.emailConfirmation.confirmationCode;
        }
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
