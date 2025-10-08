/*
  Warnings:

  - The values [ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `paymentStatus` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `visitType` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `about` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `degree` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `fees` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[patientId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "QueueType" AS ENUM ('APPOINTMENT', 'EMERGENCY', 'WALKIN');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('DOCTOR', 'STAFF', 'PATIENT');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "paymentStatus",
DROP COLUMN "visitType",
ADD COLUMN     "queueType" "QueueType" NOT NULL DEFAULT 'APPOINTMENT';

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "about",
DROP COLUMN "degree",
DROP COLUMN "experience",
DROP COLUMN "fees";

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "issue" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshToken",
ADD COLUMN     "patientId" TEXT;

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."VisitType";

-- CreateIndex
CREATE UNIQUE INDEX "User_patientId_key" ON "User"("patientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
