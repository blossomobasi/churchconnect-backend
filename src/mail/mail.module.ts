import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailQueue } from "./mail.processor";
import { MailService } from "./mail.service";
import { BullModule } from "@nestjs/bull";
import { ResendMailProvider } from "./resend.mail.provider";

@Module({
    imports: [
        ConfigModule,
        BullModule.registerQueue({
            name: MailQueue.name,
        }),
    ],
    providers: [MailService, MailQueue, ResendMailProvider],
    exports: [MailService],
})
export class MailModule {}
