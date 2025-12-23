// src/donations/dto/create-donation.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { DonationType } from "@prisma/client";

export class CreateDonationDto {
    @ApiProperty({
        enum: DonationType,
        description: "Type of donation",
        example: "TITHE",
    })
    @IsEnum(DonationType)
    @IsNotEmpty()
    type: DonationType;

    @ApiProperty({
        description: "Amount in Naira",
        example: 5000,
        minimum: 100,
    })
    @IsNumber()
    @Min(100, { message: "Minimum donation is ₦100" })
    @IsNotEmpty()
    amount: number;

    @ApiProperty({
        description: "Optional note or prayer request",
        required: false,
        example: "For church building project",
    })
    @IsString()
    @IsOptional()
    note?: string;
}
