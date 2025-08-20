import { EmailConfirmation } from '../emailConfirmation.schema';
import { PasswordRecovery } from '../passwordRecovery.schema';

export class UpdateUserDomainDto {
    login: string;
    email: string;
    passwordHash: string;
    emailConfirmation: EmailConfirmation;
    passwordRecovery: PasswordRecovery;
}
