import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyResetOTPDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }: { value: string }) => value.toLowerCase())
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }: { value: string }) => value.toLowerCase())
    resetOtp: string;
}
