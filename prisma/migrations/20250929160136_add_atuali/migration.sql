/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `ExpenseCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ExpenseCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."ExpenseCategory_name_key";

-- AlterTable
ALTER TABLE "public"."ExpenseCategory" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ExpenseCategory_userId_name_idx" ON "public"."ExpenseCategory"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_userId_name_key" ON "public"."ExpenseCategory"("userId", "name");

-- AddForeignKey
ALTER TABLE "public"."ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
