/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_name_key" ON "public"."Budget"("userId", "name");
