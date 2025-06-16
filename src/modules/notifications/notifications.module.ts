import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: 'smtps://verg1liy@yandex.ru:byklmezcnfoibzme@smtp.yandex.ru',
            defaults: {
                from: '"Blog Platform registration service" <verg1liy@yandex.ru>'
            }
        })
    ],
    providers: [EmailService],
    exports: [EmailService]
})
export class NotificationsModule {}
