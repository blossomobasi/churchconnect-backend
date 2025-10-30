import bcryptjs from "bcryptjs";
import moment from "moment";
import { User, Provider } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { RegisterDto } from "./dto/register.dto";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma/prisma.service";
import { PasswordResetDto, RequestPasswordResetDto } from "./dto/password-reset.dto";
import { EmailVerificationDto, RequestEmailVerificationDto } from "./dto/email-verification.dto";
import { BadRequestException, UnauthorizedException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { TokenService } from "src/token/token.service";
import { VerifyResetOTPDto } from "./dto/verify-reset-otp.dto";
import { VerifyEmailVerificationOTPDto } from "./dto/verify-email-verification-otp.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly mailService: MailService,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService
    ) {}

    async validateUser(email: string, password: string): Promise<Partial<User>> {
        const user = await this.prismaService.user.findUnique({
            where: { email },
            select: {
                id: true,
                password: true,
                firstName: true,
                lastName: true,
                provider: true,
                role: true,
            },
        });
        if (!user) throw new BadRequestException("Incorrect email or password");
        if (user.provider !== Provider.DEFAULT) {
            throw new UnauthorizedException(`This account was created with ${user.provider}. Please log in with ${user.provider}.`);
        }
        const isPasswordMatching = await bcryptjs.compare(password, user.password as string);
        if (!isPasswordMatching) throw new UnauthorizedException("Incorrect email or password");
        const { password: _, ...cleanedUser } = user;
        return cleanedUser;
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST);
        }
        const passwordHash = await bcryptjs.hash(registerDto.password, this.configService.get<number>("CONFIGS.BCRYPT_SALT") as number);
        const user = await this.prismaService.user.create({
            data: {
                email: registerDto.email,
                password: passwordHash,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
            },
        });
        await this.requestEmailVerification({ email: user.email });
        const token = await this.tokenService.generateAuthTokens(user);
        return { user, token };
    }

    async login(user: User) {
        const token = await this.tokenService.generateAuthTokens(user);
        const {
            // password,
            // verificationOtp,
            // verificationOtpExpiresAt,
            // providerId,
            // passwordResetOtp,
            // passwordResetOtpExpiresAt,
            // createdAt,
            // updatedAt,
            // emailVerified,
            ...cleanedUser
        } = user;

        return { cleanedUser, token };
    }

    async requestEmailVerification(requestEmailVerificationDto: RequestEmailVerificationDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: requestEmailVerificationDto.email },
            select: { id: true, email: true, emailVerified: true },
        });
        if (user) {
            if (user.emailVerified) throw new HttpException("Email already verified", HttpStatus.BAD_REQUEST);

            // Create 6 digit verification OTP
            const verificationOtp = Math.floor(100000 + Math.random() * 900000);

            const hashedOtp = await bcryptjs.hash(verificationOtp.toString(), this.configService.get<number>("CONFIGS.BCRYPT_SALT") as number);

            const verificationOtpExpiresAt = moment().add(10, "minutes").toDate();

            await this.prismaService.user.update({
                where: { id: user.id },
                data: { verificationOtp: hashedOtp, verificationOtpExpiresAt },
            });

            await this.mailService.sendEmailVerificationEmail(user.email, verificationOtp.toString());

            return true;
        }
    }

    async verifyResetOTP(verifiedResetOTPDto: VerifyResetOTPDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: verifiedResetOTPDto.email },
            select: {
                id: true,
                email: true,
                passwordResetOtp: true,
                passwordResetOtpExpiresAt: true,
            },
        });
        if (!user) throw new NotFoundException("Invalid or expired OTP");

        if (!user.passwordResetOtp) throw new HttpException("Invalid or expired OTP", HttpStatus.UNAUTHORIZED);

        const isResetOtpValid = await bcryptjs.compare(verifiedResetOTPDto.resetOtp, user.passwordResetOtp);
        const isResetOtpExpired = moment().isAfter(user.passwordResetOtpExpiresAt);

        if (!isResetOtpValid || isResetOtpExpired) throw new HttpException("Invalid or expired OTP", HttpStatus.UNAUTHORIZED);
    }

    async verifyEmailVerificationOTP(verifyEmailVerificationOTPDto: VerifyEmailVerificationOTPDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: verifyEmailVerificationOTPDto.email },
            select: {
                id: true,
                email: true,
                verificationOtp: true,
                verificationOtpExpiresAt: true,
            },
        });
        if (!user) throw new NotFoundException("Invalid or expired OTP");

        console.log(user);

        if (!user.verificationOtp) throw new HttpException("Invalid or expired OTP", HttpStatus.UNAUTHORIZED);

        const isEmailVerificationOtpValid = await bcryptjs.compare(verifyEmailVerificationOTPDto.verificationOtp, user.verificationOtp);
        const isEmailVerificationExpired = moment().isAfter(user.verificationOtpExpiresAt);

        if (!isEmailVerificationOtpValid || isEmailVerificationExpired) throw new HttpException("Invalid or expired OTP", HttpStatus.UNAUTHORIZED);
    }

    async verifyEmail(emailVerificationDto: EmailVerificationDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: emailVerificationDto.email },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                verificationOtp: true,
                verificationOtpExpiresAt: true,
            },
        });
        if (!user) throw new NotFoundException("User not found");
        if (user.emailVerified) throw new HttpException("Email already verified", HttpStatus.BAD_REQUEST);

        if (!user.verificationOtp) throw new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED);

        const isVerificationOtpValid = await bcryptjs.compare(emailVerificationDto.verificationOtp, user.verificationOtp);

        const isVerificationOtpExpired = moment().isAfter(user.verificationOtpExpiresAt);

        if (!isVerificationOtpValid || isVerificationOtpExpired) throw new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED);

        await this.prismaService.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationOtp: null,
                verificationOtpExpiresAt: null,
            },
        });

        return true;
    }

    async requestPasswordReset(requestResetPasswordDto: RequestPasswordResetDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: requestResetPasswordDto.email },
            select: { id: true, email: true },
        });

        if (user) {
            const resetOtp = Math.floor(100000 + Math.random() * 900000);
            const hashedOtp = await bcryptjs.hash(resetOtp.toString(), this.configService.get<number>("CONFIGS.BCRYPT_SALT") as number);

            const resetOtpExpiresAt = moment().add(10, "minutes").toDate();

            await this.prismaService.user.update({
                where: { id: user.id },
                data: {
                    passwordResetOtp: hashedOtp,
                    passwordResetOtpExpiresAt: resetOtpExpiresAt,
                },
            });
            await this.mailService.sendPasswordResetEmail(user.email, resetOtp.toString());
        }
    }

    async resetPassword(passwordResetDto: PasswordResetDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: passwordResetDto.email },
            select: {
                id: true,
                email: true,
                passwordResetOtp: true,
                passwordResetOtpExpiresAt: true,
            },
        });
        if (!user) throw new NotFoundException("Invalid or expired token");

        if (!user.passwordResetOtp) throw new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED);

        const isResetOtpValid = await bcryptjs.compare(passwordResetDto.resetOtp, user.passwordResetOtp);
        const isResetOtpExpired = moment().isAfter(user.passwordResetOtpExpiresAt);

        if (!isResetOtpValid || isResetOtpExpired) throw new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED);

        const passwordHash = await bcryptjs.hash(passwordResetDto.newPassword, this.configService.get<number>("CONFIGS.BCRYPT_SALT") as number);

        await this.prismaService.user.update({
            where: { id: user.id },
            data: {
                password: passwordHash,
                passwordResetOtp: null,
                passwordResetOtpExpiresAt: null,
            },
        });
    }

    async refreshAuthTokens(user: User, refreshToken: string) {
        return this.tokenService.refreshAuthTokens(user, refreshToken);
    }

    async revokeRefreshToken(user: User, refreshToken: string) {
        return this.tokenService.revokeRefreshToken(user, refreshToken);
    }
}
