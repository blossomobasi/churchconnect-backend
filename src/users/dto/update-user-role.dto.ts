import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Role } from "src/auth/enums/role.enums";

export class UpdateUserRoleDto {
    @ApiProperty({ description: "Update user role", example: "MEMBER" })
    @IsEnum(Role)
    role: Role;
}
