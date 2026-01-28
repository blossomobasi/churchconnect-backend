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

// import { Module } from "@nestjs/common";
// import * as aws from "@aws-sdk/client-ses";
// import { MailerModule } from "@nestjs-modules/mailer";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { MailQueue } from "./mail.processor";
// import { MailService } from "./mail.service";
// import { AwsModule } from "src/aws/aws.module";
// import { AwsService } from "src/aws/aws.service";
// import { BullModule } from "@nestjs/bull";

// @Module({
//     imports: [
//         MailerModule.forRootAsync({
//             imports: [ConfigModule, AwsModule],
//             useFactory: (config: ConfigService, awsService: AwsService) => {
//                 if (config.get("CONFIGS.MAILER.USE_AWS_SES") === true) {
//                     if (!config.get("CONFIGS.AWS.ACCESS_KEY_ID")) throw new Error("AWS_ACCESS_KEY_ID config not found");
//                     if (!config.get("CONFIGS.AWS.SECRET_ACCESS_KEY")) throw new Error("AWS_SECRET_ACCESS_KEY config not found");

//                     return {
//                         transporter: {
//                             sendingRate: 50,
//                             SES: { aws: aws, ses: awsService.sesClient },
//                         },
//                     };
//                 } else if (config.get("CONFIGS.MAILER.USE_GMAIL_SMTP") === true) {
//                     console.log("Using Gmail SMTP");
//                     console.log("Using Gmail SMTP");
//                     console.log("Using Gmail SMTP");
//                     console.log("Using Gmail SMTP");
//                     console.log("Using Gmail SMTP");
//                     console.log("Using Gmail SMTP");
//                     console.log("Using Gmail SMTP");
//                     if (!config.get("CONFIGS.MAILER.SMTP_USER")) throw new Error("SMTP_USER config not found");
//                     if (!config.get("CONFIGS.MAILER.SMTP_PASSWORD")) throw new Error("SMTP_PASSWORD config not found");
//                     return {
//                         transport: {
//                             service: "gmail",
//                             auth: {
//                                 user: config.get("CONFIGS.MAILER.SMTP_USER"),
//                                 pass: config.get("CONFIGS.MAILER.SMTP_PASSWORD"),
//                             },
//                         },
//                     };
//                 } else {
//                     if (!config.get("CONFIGS.MAILER.SMTP_HOST")) throw new Error("SMTP_HOST config not found");
//                     if (!config.get("CONFIGS.MAILER.SMTP_PORT")) throw new Error("SMTP_PORT config not found");
//                     if (!config.get("CONFIGS.MAILER.SMTP_USER")) throw new Error("SMTP_USER config not found");
//                     if (!config.get("CONFIGS.MAILER.SMTP_PASSWORD")) throw new Error("SMTP_PASSWORD config not found");

//                     return {
//                         transport: {
//                             host: config.get("CONFIGS.MAILER.SMTP_HOST"),
//                             port: Number(config.get("CONFIGS.MAILER.SMTP_PORT")),
//                             secure: Boolean(config.get("CONFIGS.MAILER.SECURE")),
//                             from: config.get("CONFIGS.MAILER.FROM_EMAIL"),
//                             auth: {
//                                 user: config.get("CONFIGS.MAILER.SMTP_USER"),
//                                 pass: config.get("CONFIGS.MAILER.SMTP_PASSWORD"),
//                             },
//                         },
//                     };
//                 }
//             },
//             inject: [ConfigService, AwsService],
//         }),
//         BullModule.registerQueue({
//             name: MailQueue.name,
//         }),
//         AwsModule,
//     ],
//     providers: [MailService, MailQueue],
//     exports: [MailService],
// })
// export class MailModule {}
