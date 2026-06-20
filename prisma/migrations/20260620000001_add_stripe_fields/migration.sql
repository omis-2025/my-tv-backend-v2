-- AlterTable users: add stripeCustomerId
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" TEXT;
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- AlterTable packages: add stripePriceId
ALTER TABLE "packages" ADD COLUMN "stripePriceId" TEXT;

-- AlterTable subscriptions: add stripe fields
ALTER TABLE "subscriptions" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN "stripePriceId" TEXT;
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
