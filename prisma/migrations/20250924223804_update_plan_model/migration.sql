/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "features",
DROP COLUMN "updatedAt";
