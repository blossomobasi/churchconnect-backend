import { User } from "@prisma/client";

export interface initializeTransaction {
    user: User;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: any;
}
