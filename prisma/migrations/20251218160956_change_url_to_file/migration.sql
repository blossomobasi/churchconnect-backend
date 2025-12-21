/*
  Warnings:

  - Added the required column `url` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "size" INTEGER,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sermon" ADD COLUMN     "audioFileId" TEXT,
ADD COLUMN     "thumbnailFileId" TEXT,
ADD COLUMN     "videoFileId" TEXT;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
