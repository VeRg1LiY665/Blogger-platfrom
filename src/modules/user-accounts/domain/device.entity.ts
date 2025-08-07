import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateDeviceDomainDto } from './dto/CreateDeviceDomainDto';

@Schema({ timestamps: false })
export class SecurityDevice {
    id: number;

    userId: string;

    title: string;

    ip: string;

    iat: number;

    static createInstance(dto: CreateDeviceDomainDto): SecurityDevice {
        const securityDevice = new this();
        securityDevice.userId = dto.userId;
        securityDevice.title = dto.title;
        securityDevice.iat = dto.iat;
        securityDevice.ip = dto.ip;

        return securityDevice;
    }

    updateInstance(iat: number) {
        //updates iat for device in case of token refresh
        this.iat = iat;
    }
}

export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);

SecurityDeviceSchema.loadClass(SecurityDevice);

export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;

export type SecurityDeviceModelType = Model<SecurityDeviceDocument> & typeof SecurityDevice;
