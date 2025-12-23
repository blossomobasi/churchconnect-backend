/*
  Warnings:

  - You are about to drop the column `date` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Donation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "date",
DROP COLUMN "description",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_reference_key" ON "Donation"("reference");
