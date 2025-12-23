export interface initializeTransaction {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: any;
}
