-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('DEFAULT', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'DEFAULT';
