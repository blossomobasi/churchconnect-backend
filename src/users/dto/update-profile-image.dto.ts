import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileImageDto {
    @ApiPropertyOptional({ type: "string", format: "binary" })
    @IsOptional()
    profileImageFile?: Express.Multer.File;
}
