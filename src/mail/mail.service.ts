import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { MailQueue } from "./mail.processor";
import { render } from "@react-email/render";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import { WelcomeMail } from "./templates/v1/welcome";
import { PasswordResetOtp } from "./templates/v1/passwordResetOtp";
import { VerificationOtp } from "./templates/v1/verificationOtp";
import { ResendMailProvider } from "./resend.mail.provider";

@Injectable()
export class MailService {
    private logger = new Logger(MailService.name);

    constructor(
        private readonly resendProvider: ResendMailProvider,
        private readonly configService: ConfigService,
        @InjectQueue(MailQueue.name) private readonly mailQueue: Queue
    ) {}

    async sendEmail<T extends Record<string, any>>(email: string, subject: string, templateFn: (props: T) => React.ReactElement, props: T) {
        if (this.configService.get("CONFIGS.USE_EMAIL_QUEUE")) {
            await this.mailQueue.add("enqueueEmail", {
                email,
                subject,
                templateFn: templateFn.name,
                props,
            });
            return;
        }

        const html = await render(templateFn(props), { plainText: false });

        await this.resendProvider.sendMail({
            to: email,
            subject,
            html,
        });
    }

    async sendWelcomeEmail(email: string, name: string) {
        return this.sendEmail(email, "Welcome to ChurchConnect", WelcomeMail, { name });
    }

    async sendPasswordResetEmail(email: string, otp: string) {
        return this.sendEmail(email, "Reset your password", PasswordResetOtp, { otp });
    }

    async sendEmailVerificationEmail(email: string, otp: string) {
        return this.sendEmail(email, "Verify your email", VerificationOtp, { otp });
    }
}
