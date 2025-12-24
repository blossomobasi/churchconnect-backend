import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import configuration from "../configs";
import { CacheModule } from "@nestjs/cache-manager";
import { MailModule } from "./mail/mail.module";
import { JwtModule } from "@nestjs/jwt";
import { AwsModule } from "./aws/aws.module";
import { createKeyv } from "@keyv/redis";
import { TokenModule } from "./token/token.module";
import { CommonModule } from "./common/common.module";
import { FileModule } from "./file/file.module";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { BullModule } from "@nestjs/bull";
import { SermonModule } from "./sermon/sermon.module";
import { DepartmentModule } from "./department/department.module";
import { DonationsModule } from "./donations/donations.module";
import { PrayerRequestModule } from "./prayer-request/prayer-request.module";
import { EventModule } from "./events/event.module";

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: configService.get<string>("CONFIGS.REDIS_URI"),
                defaultJobOptions: {
                    attempts: 3,
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            }),
        }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            isGlobal: true,
            useFactory: async (configService: ConfigService) => {
                return {
                    stores: [createKeyv(configService.get<string>("CONFIGS.REDIS_URI"))],
                };
            },
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env", ".env.local"],
            load: [configuration],
        }),
        MailModule,
        JwtModule,
        AwsModule,
        AuthModule,
        TokenModule,
        CommonModule,
        FileModule,
        PrismaModule,
        SermonModule,
        DepartmentModule,
        DonationsModule,
        PrayerRequestModule,
        EventModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes("*");
    }
}
