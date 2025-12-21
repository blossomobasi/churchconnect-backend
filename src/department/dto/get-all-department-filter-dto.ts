import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetAllDepartmentFilterDto {
    @ApiPropertyOptional({ type: String, description: "Name of the department" })
    @IsString()
    @IsOptional()
    name?: string;
}
