import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { render } from "@react-email/render";
import { ConfigService } from "@nestjs/config";
import { AwsService } from "src/aws/aws.service";
import { Process, Processor } from "@nestjs/bull";
import { EnqueueMailDto } from "./dto/enqueue-mail.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { WelcomeMail } from "src/mail/templates/v1/welcome";
import { PasswordResetOtp } from "src/mail/templates/v1/passwordResetOtp";
import { VerificationOtp } from "./templates/v1/verificationOtp";

@Processor(MailQueue.name)
export class MailQueue {
    private readonly logger = new Logger(MailQueue.name);

    constructor(
        private readonly awsService: AwsService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService
    ) {}

    @Process("enqueueEmail")
    async enqueueEmail(job: Job<EnqueueMailDto<any>>) {
        try {
            const mailTemplateMap = {
                [WelcomeMail.name]: WelcomeMail,
                [PasswordResetOtp.name]: PasswordResetOtp,
                [VerificationOtp.name]: VerificationOtp,
            };

            const templateFn = mailTemplateMap[job.data.templateFn];

            const html = await render(templateFn(job.data.props), {
                plainText: false,
            });

            await this.mailerService.sendMail({
                ...job.data.options,
                html,
            });

            this.logger.debug(`Status processing completed for job: ${job.id}`);

            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to process content: ${(error as Error).message}`, (error as Error).stack);
            throw error;
        }
    }
}
