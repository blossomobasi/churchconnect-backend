import { User } from "@prisma/client";

export type SafeUser = Omit<User, "password" | "verificationOtp" | "verificationOtpExpiresAt" | "passwordResetOtp" | "passwordResetOtpExpiresAt">;

export function sanitizeUser(user: User): SafeUser;
export function sanitizeUser(user: User[]): SafeUser[];
export function sanitizeUser(user: User | User[]): SafeUser | SafeUser[] {
    if (Array.isArray(user)) {
        return user.map((u) => {
            const { password: _, verificationOtp: __, verificationOtpExpiresAt: ___, passwordResetOtp: ____, passwordResetOtpExpiresAt: _____, ...safeUser } = u;
            return safeUser;
        });
    }

    const { password: _, verificationOtp: __, verificationOtpExpiresAt: ___, passwordResetOtp: ____, passwordResetOtpExpiresAt: _____, ...safeUser } = user;

    return safeUser;
}
