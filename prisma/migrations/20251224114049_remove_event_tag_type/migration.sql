/*
  Warnings:

  - You are about to drop the `EventTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EventTag" DROP CONSTRAINT "EventTag_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "tags" TEXT[];

-- DropTable
DROP TABLE "public"."EventTag";

-- DropEnum
DROP TYPE "public"."EventTagType";
