import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePrayerRequestDto {
    @ApiProperty({ type: String, description: "Prayer request title" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ type: String, description: "Prayer request content" })
    @IsString()
    @IsNotEmpty()
    content: string;
}
