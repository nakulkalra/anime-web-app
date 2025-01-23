/*
  Warnings:

  - You are about to drop the column `filepath` on the `UploadedFile` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UploadedFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `UploadedFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UploadedFile" DROP COLUMN "filepath",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
