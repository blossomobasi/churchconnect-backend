import { Module } from "@nestjs/common";
import { TestimonyService } from "./testimony.service";
import { TestimonyController } from "./testimony.controller";

@Module({
    controllers: [TestimonyController],
    providers: [TestimonyService],
})
export class TestimonyModule {}
