-- Backfill existing expenses with splits among all trip members
INSERT INTO "public"."ExpenseSplit" ("id", "expenseId", "memberId", "share", "createdAt")
SELECT 
    gen_random_uuid()::text as id,
    e.id as "expenseId",
    tm.id as "memberId",
    (e.cost / member_count.count) as share,
    NOW() as "createdAt"
FROM "public"."Expense" e
CROSS JOIN "public"."TripMember" tm
INNER JOIN "public"."Budget" b ON e."budgetId" = b.id
INNER JOIN (
    SELECT b.id as budget_id, COUNT(tm.id) as count
    FROM "public"."Budget" b
    INNER JOIN "public"."TripMember" tm ON b."tripId" = tm."tripId"
    GROUP BY b.id
) member_count ON b.id = member_count.budget_id
WHERE tm."tripId" = b."tripId"
  AND member_count.count > 0;
