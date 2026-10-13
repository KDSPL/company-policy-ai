/*
  Warnings:

  - The values [READY] on the enum `DocumentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileHash]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentStatus_new" AS ENUM ('UPLOADING', 'ACTIVE', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."Document" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "status" TYPE "DocumentStatus_new" USING ("status"::text::"DocumentStatus_new");
ALTER TYPE "DocumentStatus" RENAME TO "DocumentStatus_old";
ALTER TYPE "DocumentStatus_new" RENAME TO "DocumentStatus";
DROP TYPE "public"."DocumentStatus_old";
ALTER TABLE "Document" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "userId",
ADD COLUMN     "fileHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_fileHash_key" ON "Document"("fileHash");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
