import { User } from "@prisma/client";

type SanitizedUser = Omit<User, "password" | "verificationOtp" | "verificationOtpExpiresAt" | "passwordResetOtp" | "passwordResetOtpExpiresAt">;

export function sanitizeUser(user: User | User[]): SanitizedUser | SanitizedUser[] | null {
    if (Array.isArray(user)) return user.map(sanitizeUser) as User[];
    if (!user) return null;

    const { password: _, verificationOtp: __, verificationOtpExpiresAt: ___, passwordResetOtp: ____, passwordResetOtpExpiresAt: _____, ...safeUser } = user;

    return safeUser;
}
