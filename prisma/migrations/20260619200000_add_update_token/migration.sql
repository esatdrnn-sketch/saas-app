-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "updateToken" TEXT;

-- Backfill existing rows with unique tokens
UPDATE "Subscription" SET "updateToken" = gen_random_uuid()::text WHERE "updateToken" IS NULL;

-- Set default and NOT NULL
ALTER TABLE "Subscription" ALTER COLUMN "updateToken" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Subscription" ALTER COLUMN "updateToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_updateToken_key" ON "Subscription"("updateToken");
