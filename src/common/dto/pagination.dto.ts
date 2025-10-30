import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 10;
}
