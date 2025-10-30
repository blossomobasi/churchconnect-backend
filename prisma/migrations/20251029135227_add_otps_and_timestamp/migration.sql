-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetOtp" TEXT,
ADD COLUMN     "passwordResetOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationOtp" TEXT,
ADD COLUMN     "verificationOtpExpiresAt" TIMESTAMP(3);
