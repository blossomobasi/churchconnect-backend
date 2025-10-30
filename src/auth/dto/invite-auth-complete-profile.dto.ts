import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InviteAuthCompleteProfileDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    token: string;

    @ApiProperty()
    @IsString()
    password: string;
}
