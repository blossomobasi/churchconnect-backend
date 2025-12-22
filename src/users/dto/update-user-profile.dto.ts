import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateUserProfileDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    address?: string;
}
