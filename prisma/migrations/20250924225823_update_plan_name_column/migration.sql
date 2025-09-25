/*
  Warnings:

  - You are about to drop the column `planId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_planId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "planId",
ADD COLUMN     "planName" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_planName_fkey" FOREIGN KEY ("planName") REFERENCES "public"."Plan"("name") ON DELETE SET NULL ON UPDATE CASCADE;
