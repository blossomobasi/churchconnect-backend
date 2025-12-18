import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUrl } from "class-validator";

export class CreateSermonDto {
    @ApiProperty({ type: String, description: "Title of the sermon" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ type: String, description: "Description of the sermon" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ type: String, description: "Name of the preacher" })
    @IsString()
    @IsNotEmpty()
    preacher: string;

    @ApiProperty({ type: String, format: "date-time", description: "Date the sermon was preached" })
    @IsDateString()
    @IsNotEmpty()
    datePreached: Date;

    @ApiPropertyOptional({ type: String, description: "Scripture text referenced in the sermon", required: false })
    @IsString()
    @IsOptional()
    scriptureText?: string;

    // Video file
    @ApiPropertyOptional({ type: String, format: "binary", description: "Video file of the sermon", required: false })
    @IsOptional()
    videoFile?: Express.Multer.File;

    // Audio file
    @ApiPropertyOptional({ type: String, format: "binary", description: "Audio file of the sermon", required: false })
    @IsOptional()
    audioFile?: Express.Multer.File;

    // Thumbnail file
    @ApiPropertyOptional({ type: String, format: "binary", description: "Thumbnail file for the sermon", required: false })
    @IsOptional()
    thumbnailFile?: Express.Multer.File;
}
