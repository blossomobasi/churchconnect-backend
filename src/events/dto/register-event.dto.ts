import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegisterEventDto {
    @ApiProperty({ description: "Event ID" })
    @IsString()
    @IsNotEmpty()
    eventId: string;
}
