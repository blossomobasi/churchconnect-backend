import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean, IsInt, Min } from "class-validator";
import { Transform } from "class-transformer";

export class CreateEventDto {
    @ApiProperty({ description: "Event title" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ description: "Event description" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ type: String, isArray: true })
    @Transform(({ value }: { value: string }) => value.split(","))
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ type: String, format: "date-time", description: "Event start date and time" })
    @IsDateString()
    @IsNotEmpty()
    startDateTime: string;

    @ApiProperty({ type: String, format: "date-time", description: "Event end date and time" })
    @IsDateString()
    @IsNotEmpty()
    endDateTime: string;

    @ApiPropertyOptional({ description: "Physical location" })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({ description: "Is this a virtual event?", default: false })
    @Transform(({ value }: { value: string }) => value === "true")
    @IsBoolean()
    isVirtual: boolean;

    @ApiPropertyOptional({ description: "Virtual meeting link (Zoom, Google Meet, etc.)" })
    @IsOptional()
    virtualMeetingLink?: string;

    @ApiPropertyOptional({ description: "Maximum number of attendees" })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === "" || value === null || value === undefined) {
            return null;
        }
        return Number(value);
    })
    @IsInt()
    @Min(1)
    capacity?: number | null;

    @ApiPropertyOptional({ type: "string", format: "binary", description: "Event image" })
    image?: any;
}
