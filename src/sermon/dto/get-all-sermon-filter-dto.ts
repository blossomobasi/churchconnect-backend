import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetAllSermonFilterDto {
    @ApiPropertyOptional({ type: String, description: "Filter by preacher name" })
    @IsString()
    @IsOptional()
    preacher?: string;

    @ApiPropertyOptional({ type: String, description: "Filter by sermon title" })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ type: Date, description: "Filter by date preached (YYYY-MM-DD)" })
    @IsOptional()
    datePreached?: Date;
}
