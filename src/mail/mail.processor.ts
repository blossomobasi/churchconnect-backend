import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { render } from "@react-email/render";
import { Process, Processor } from "@nestjs/bull";
import { WelcomeMail } from "src/mail/templates/v1/welcome";
import { PasswordResetOtp } from "src/mail/templates/v1/passwordResetOtp";
import { VerificationOtp } from "./templates/v1/verificationOtp";
import { ResendMailProvider } from "./resend.mail.provider";
import { JSX } from "react";

type MailTemplateKey = "WelcomeMail" | "PasswordResetOtp" | "VerificationOtp";

@Processor(MailQueue.name)
export class MailQueue {
    private readonly logger = new Logger(MailQueue.name);

    constructor(private readonly resendProvider: ResendMailProvider) {}

    @Process("enqueueEmail")
    async enqueueEmail(job: Job<any>) {
        const { email, subject, templateFn, props } = job.data;

        const templates: Record<MailTemplateKey, (props: any) => JSX.Element> = {
            WelcomeMail,
            PasswordResetOtp,
            VerificationOtp,
        };

        const template = templates[templateFn as MailTemplateKey];
        if (!template) {
            throw new Error(`Unknown mail template: ${templateFn}`);
        }

        const html = await render(template(props), { plainText: false });

        await this.resendProvider.sendMail({
            to: email,
            subject,
            html,
        });

        this.logger.log(`Email sent to ${email}`);
    }
}
