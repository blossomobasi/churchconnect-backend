import { Module } from "@nestjs/common";
import { DonationsService } from "./donations.service";
import { DonationsController } from "./donations.controller";
import { PaystackModule } from "src/paystack/paystack.module";

@Module({
    imports: [PaystackModule],
    controllers: [DonationsController],
    providers: [DonationsService],
})
export class DonationsModule {}
