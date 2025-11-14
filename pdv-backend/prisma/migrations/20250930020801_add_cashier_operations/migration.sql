-- CreateTable
CREATE TABLE "public"."cashier_operations" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balance" DECIMAL(65,30),
    "difference" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "cashier_operations_pkey" PRIMARY KEY ("id")
);
