/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `Sermon` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Sermon` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Sermon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sermon" DROP COLUMN "audioUrl",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "videoUrl";
