import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileImageDto {
    @ApiPropertyOptional()
    @IsOptional()
    profileImageFile?: Express.Multer.File;
}
