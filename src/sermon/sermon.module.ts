import { Module } from "@nestjs/common";
import { SermonService } from "./sermon.service";
import { SermonController } from "./sermon.controller";
import { FileModule } from "src/file/file.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [JwtModule.register({}), FileModule],
    controllers: [SermonController],
    providers: [SermonService],
})
export class SermonModule {}
