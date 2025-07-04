import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceContextDto } from '../dto/device-context.dto';

export const ExtractDeviceInfoFromRequest = createParamDecorator(
    (data: unknown, context: ExecutionContext): DeviceContextDto => {
        const request = context.switchToHttp().getRequest();

        const deviceInfo = request.clientInfo;

        if (!deviceInfo) {
            throw new Error('there is no client data in the request object!');
        }

        return deviceInfo;
    }
);
