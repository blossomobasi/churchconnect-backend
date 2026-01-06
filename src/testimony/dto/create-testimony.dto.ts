import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTestimonyDto {
    @ApiProperty({ type: String, description: "Testimony title", example: "Testimony title" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ type: String, description: "Testimony content", example: "Testimony content" })
    @IsString()
    @IsNotEmpty()
    content: string;
}
