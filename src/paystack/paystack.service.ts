import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { initializeTransaction } from "./entity/paystack.entity";

@Injectable()
export class PaystackService {
    private readonly paystackBaseUrl: string;
    private readonly paystackSecretKey: string;

    constructor(private readonly configService: ConfigService) {
        this.paystackBaseUrl = this.configService.get<string>("CONFIGS.PAYSTACK.BASE_URL") ?? "";
        this.paystackSecretKey = this.configService.get<string>("CONFIGS.PAYSTACK.SECRET_KEY") ?? "";
    }

    async initializeTransaction(data: initializeTransaction) {
        try {
            const response = await axios.post(
                `${this.paystackBaseUrl}/transaction/initialize`,
                {
                    email: data.email,
                    amount: data.amount,
                    reference: data.reference || this.generateReference(),
                    callback_url: data.callback_url || this.configService.get("PAYSTACK_CALLBACK_URL"),
                    metadata: data.metadata,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            console.error("Paystack initialization error:", error.response?.data);
            throw new BadRequestException(error.response?.data?.message || "Failed to initialize payment");
        }
    }

    async verifyTransaction(reference: string) {
        try {
            const response = await axios.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                },
            });

            return response.data.data;
        } catch (error: any) {
            console.error("Paystack verification error:", error.response?.data);
            throw new BadRequestException(error.response?.data?.message || "Failed to verify payment");
        }
    }

    private generateReference(): string {
        return `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    }
}
