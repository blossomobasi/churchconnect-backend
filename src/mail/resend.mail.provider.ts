import { Resend } from "resend";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ResendMailProvider {
    private resend: Resend;

    constructor(private readonly configService: ConfigService) {
        this.resend = new Resend(this.configService.get<string>("CONFIGS.MAILER.RESEND_API_KEY"));
    }

    async sendMail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
        const result = await this.resend.emails.send({
            from: this.configService.get<string>("CONFIGS.MAILER.FROM_EMAIL")!,
            to,
            subject,
            html,
        });

        return result;
    }
}
