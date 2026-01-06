import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class GetTestimonyFilterDto {
    @ApiPropertyOptional({ type: Boolean, description: "Filter by isApproved" })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === "true") return true;
        if (value === "false") return false;
        if (typeof value === "boolean") return value;
        return undefined;
    })
    isApproved?: boolean;
}
