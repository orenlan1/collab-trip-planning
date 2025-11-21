-- DropForeignKey
ALTER TABLE "public"."Expense" DROP CONSTRAINT "Expense_activityId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
