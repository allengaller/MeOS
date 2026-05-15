-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "costPerCycle" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "websiteUrl" TEXT,
    "notes" TEXT,
    "config" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuotaDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "monthlyLimit" REAL NOT NULL,
    "warningThreshold" REAL NOT NULL DEFAULT 0.8,
    "criticalThreshold" REAL NOT NULL DEFAULT 0.95,
    "order" INTEGER NOT NULL DEFAULT 0,
    "quotaType" TEXT NOT NULL DEFAULT 'consumable',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuotaDefinition_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "notes" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthlyUsage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuotaUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthlyUsageId" TEXT NOT NULL,
    "quotaDefinitionId" TEXT NOT NULL,
    "usedAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuotaUsage_monthlyUsageId_fkey" FOREIGN KEY ("monthlyUsageId") REFERENCES "MonthlyUsage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuotaUsage_quotaDefinitionId_fkey" FOREIGN KEY ("quotaDefinitionId") REFERENCES "QuotaDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MindsetSlogan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MindsetSlogan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Subscription_userId_isActive_idx" ON "Subscription"("userId", "isActive");

-- CreateIndex
CREATE INDEX "QuotaDefinition_subscriptionId_idx" ON "QuotaDefinition"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotaDefinition_subscriptionId_name_key" ON "QuotaDefinition"("subscriptionId", "name");

-- CreateIndex
CREATE INDEX "MonthlyUsage_subscriptionId_year_month_idx" ON "MonthlyUsage"("subscriptionId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyUsage_subscriptionId_year_month_key" ON "MonthlyUsage"("subscriptionId", "year", "month");

-- CreateIndex
CREATE INDEX "QuotaUsage_quotaDefinitionId_idx" ON "QuotaUsage"("quotaDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotaUsage_monthlyUsageId_quotaDefinitionId_key" ON "QuotaUsage"("monthlyUsageId", "quotaDefinitionId");

-- CreateIndex
CREATE INDEX "MindsetSlogan_userId_category_idx" ON "MindsetSlogan"("userId", "category");

-- CreateIndex
CREATE INDEX "MindsetSlogan_userId_order_idx" ON "MindsetSlogan"("userId", "order");
