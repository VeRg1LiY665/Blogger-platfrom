import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class GetDeviceInfoInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Extract IP address (considering proxies)
        const ip =
            request.headers['x-forwarded-for'] || request.socket?.remoteAddress || request.connection?.remoteAddress;
        const userAgent = request.headers['user-agent'];
        // Extract User-Agent
        // Attach to request object
        request.clientInfo = {
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent: userAgent
        };
        return next.handle();
    }
}
