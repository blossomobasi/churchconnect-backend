import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { MailQueue } from "./mail.processor";
import { render } from "@react-email/render";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { WelcomeMail, WelcomeMailProps } from "./templates/v1/welcome";
import { PasswordResetOtp, PasswordResetOtpProps } from "./templates/v1/passwordResetOtp";
import { VerificationOtp, VerificationOtpProps } from "./templates/v1/verificationOtp";
@Injectable()
export class MailService {
    private logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        @InjectQueue(MailQueue.name) private readonly mailQueue: Queue
    ) {}

    async sendEmail<T extends Record<string, any>>(email: string, subject: string, templateFn: (props: T) => React.ReactElement, props: T): Promise<void> {
        const options: ISendMailOptions = {
            to: email,
            subject: subject,
        };

        if (this.configService.get("CONFIGS.MAILER.USE_EMAIL_QUEUE")) {
            await this.mailQueue.add("enqueueEmail", {
                options,
                templateFn: templateFn.name,
                props,
            });
        } else {
            const html = await render(templateFn(props), {
                plainText: false,
            });

            options.html = html;

            await this.mailerService.sendMail(options);
        }
    }

    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        await this.sendEmail<WelcomeMailProps>(email, "Welcome to PitchPan", WelcomeMail, { name });
    }

    async sendPasswordResetEmail(email: string, resetOTP: string): Promise<void> {
        await this.sendEmail<PasswordResetOtpProps>(email, "Reset your password", PasswordResetOtp, { otp: resetOTP });
    }

    async sendEmailVerificationEmail(email: string, verificationOTP: string): Promise<void> {
        await this.sendEmail<VerificationOtpProps>(email, "Verify your email", VerificationOtp, { otp: verificationOTP });
    }
}
