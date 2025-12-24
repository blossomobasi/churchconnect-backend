import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { FileModule } from "../file/file.module";

@Module({
    imports: [FileModule],
    controllers: [EventController],
    providers: [EventService],
})
export class EventModule {}
