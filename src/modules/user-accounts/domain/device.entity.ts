import { CreateDeviceDomainDto } from './dto/CreateDeviceDomainDto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SecurityDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column()
    title: string;

    @Column()
    ip: string;

    @Column({ type: 'bigint' }) //Possibly leads to 500 error as js bigint is larger than postgres one
    iat: bigint;

    static createInstance(dto: CreateDeviceDomainDto): SecurityDevice {
        const securityDevice = new this();
        securityDevice.userId = dto.userId;
        securityDevice.title = dto.title;
        securityDevice.iat = dto.iat;
        securityDevice.ip = dto.ip;

        return securityDevice;
    }

    updateInstance(iat: bigint) {
        //updates iat for device in case of token refresh
        this.iat = iat;
    }
}
