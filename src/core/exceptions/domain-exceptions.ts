import { DomainExceptionCode } from './domain-exception-codes';

export class Extension {
    constructor(
        public message: string,
        public key: string
    ) {}
}

export class DomainException extends Error {
    message: string;
    code: DomainExceptionCode;
    extensions: Extension[];

    constructor(errorInfo: { code: DomainExceptionCode; message: string; extensions?: Extension[] }) {
        super(errorInfo.message);
        this.message = errorInfo.message;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.code = errorInfo.code;
        this.extensions = errorInfo.extensions || [];
    }
}
