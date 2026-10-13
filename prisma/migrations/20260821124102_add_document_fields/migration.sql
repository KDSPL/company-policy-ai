/*
  Warnings:

  - The values [UPLOADING,COMPLETED] on the enum `DocumentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `errorMessage` on the `Document` table. All the data in the column will be lost.
  - Made the column `fileHash` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentStatus_new" AS ENUM ('ACTIVE', 'READY', 'FAILED');
ALTER TABLE "public"."Document" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "status" TYPE "DocumentStatus_new" USING ("status"::text::"DocumentStatus_new");
ALTER TYPE "DocumentStatus" RENAME TO "DocumentStatus_old";
ALTER TYPE "DocumentStatus_new" RENAME TO "DocumentStatus";
DROP TYPE "public"."DocumentStatus_old";
ALTER TABLE "Document" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploadedBy_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "errorMessage",
ALTER COLUMN "fileHash" SET NOT NULL;
