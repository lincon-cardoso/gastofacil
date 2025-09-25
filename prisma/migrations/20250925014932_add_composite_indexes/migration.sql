-- CreateIndex
CREATE INDEX "Plan_name_price_idx" ON "public"."Plan"("name", "price");

-- CreateIndex
CREATE INDEX "User_email_createdAt_idx" ON "public"."User"("email", "createdAt");
