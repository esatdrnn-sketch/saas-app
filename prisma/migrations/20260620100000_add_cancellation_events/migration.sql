CREATE TYPE "CancelReason" AS ENUM ('TOO_EXPENSIVE', 'TECHNICAL', 'TEMPORARY', 'ALTERNATIVE');

CREATE TYPE "CancelOutcome" AS ENUM ('ACCEPT_DISCOUNT', 'ACCEPT_PAUSE', 'CANCEL');

CREATE TABLE "CancellationEvent" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "reason" "CancelReason" NOT NULL,
    "action" "CancelOutcome" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CancellationEvent" ADD CONSTRAINT "CancellationEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
