import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class GetAllEventsFilterDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    eventTitle?: string;

    @ApiPropertyOptional({ type: String, format: "date-time", description: "Filter events from this date" })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ type: String, format: "date-time", description: "Filter events from this date" })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}
