import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: "blossomobasi5@gmail.com" })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "password" })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: "Blossom" })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: "Obasi" })
    @IsString()
    @IsNotEmpty()
    lastName: string;
}
