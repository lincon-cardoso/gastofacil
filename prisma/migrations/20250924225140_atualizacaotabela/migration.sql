-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_planId_fkey";

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("name") ON DELETE SET NULL ON UPDATE CASCADE;
