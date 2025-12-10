import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: "blossomobasi5@gmail.com" })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: "password" })
    @IsString()
    @IsNotEmpty()
    password: string;
}
