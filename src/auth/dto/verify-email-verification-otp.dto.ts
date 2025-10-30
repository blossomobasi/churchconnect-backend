import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailVerificationOTPDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    verificationOtp: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }: { value: string }) => value.toLowerCase())
    email: string;
}
