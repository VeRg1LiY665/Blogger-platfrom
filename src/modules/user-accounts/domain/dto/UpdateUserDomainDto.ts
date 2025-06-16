import { emailConfirmation } from '../emailConfirmation.schema';
import { passwordRecovery } from '../passwordRecovery.schema';

export class UpdateUserDomainDto {
    login: string;
    email: string;
    passwordHash: string;
    emailConfirmation: emailConfirmation;
    passwordRecovery: passwordRecovery;
}
