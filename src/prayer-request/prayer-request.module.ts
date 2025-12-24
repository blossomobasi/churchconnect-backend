import { Module } from "@nestjs/common";
import { PrayerRequestService } from "./prayer-request.service";
import { PrayerRequestController } from "./prayer-request.controller";

@Module({
    controllers: [PrayerRequestController],
    providers: [PrayerRequestService],
})
export class PrayerRequestModule {}
