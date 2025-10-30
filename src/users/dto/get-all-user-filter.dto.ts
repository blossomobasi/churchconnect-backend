import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetAllUserFilterDto {
    @ApiPropertyOptional({ type: String, example: "John Doe" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ type: String, example: "wisdomdakoh@gmail.com" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    email?: string;

    @ApiPropertyOptional({ type: Date, example: "2021-01-01" })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({ type: Date, example: "2021-01-01" })
    @IsOptional()
    @IsDateString()
    dateTo?: string;
}
