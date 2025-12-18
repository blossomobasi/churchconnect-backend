import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetAllUserFilterDto {
    @ApiPropertyOptional({ type: String, description: "Name of the user" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ type: String, description: "Email of the user" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    email?: string;

    @ApiPropertyOptional({ type: Date, description: "Start date for filtering users" })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({ type: Date, description: "End date for filtering users" })
    @IsOptional()
    @IsDateString()
    dateTo?: string;
}
