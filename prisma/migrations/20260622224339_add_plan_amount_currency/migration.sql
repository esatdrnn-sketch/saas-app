-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "planName" TEXT;
