import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaystackService } from "../paystack/paystack.service";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { DonationStatus } from "@prisma/client";

@Injectable()
export class DonationsService {
    constructor(
        private prismaService: PrismaService,
        private paystackService: PaystackService
    ) {}

    async initializeDonation(userId: string, email: string, createDonationDto: CreateDonationDto) {
        // Convert Naira to Kobo (Paystack uses kobo)
        const amountInKobo = Math.round(createDonationDto.amount * 100);

        // Initialize payment with Paystack
        const paystackResponse = await this.paystackService.initializeTransaction({
            email,
            amount: amountInKobo,
            metadata: {
                userId,
                donationType: createDonationDto.type,
                note: createDonationDto.note,
            },
        });

        // Save donation record as PENDING
        const donation = await this.prismaService.donation.create({
            data: {
                userId,
                type: createDonationDto.type,
                amount: createDonationDto.amount,
                reference: paystackResponse.reference,
                status: DonationStatus.PENDING,
                note: createDonationDto.note,
            },
        });

        return {
            donation_id: donation.id,
            authorization_url: paystackResponse.authorization_url,
            access_code: paystackResponse.access_code,
            reference: paystackResponse.reference,
        };
    }

    async verifyDonation(reference: string) {
        // Verify payment with Paystack
        const paystackData = await this.paystackService.verifyTransaction(reference);

        // Find donation
        const donation = await this.prismaService.donation.findUnique({
            where: { reference },
        });

        if (!donation) {
            throw new NotFoundException("Donation not found");
        }

        // Update status based on Paystack response
        const updatedDonation = await this.prismaService.donation.update({
            where: { reference },
            data: {
                status: paystackData.status === "success" ? DonationStatus.SUCCESS : DonationStatus.FAILED,
                paidAt: paystackData.status === "success" ? new Date(paystackData.paid_at) : null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return updatedDonation;
    }

    async getUserDonations(userId: string) {
        return this.prismaService.donation.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async getAllDonations() {
        return this.prismaService.donation.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
}
