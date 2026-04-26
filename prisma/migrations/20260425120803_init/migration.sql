/*
  Warnings:

  - A unique constraint covering the columns `[midtransOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "midtransOrderId" TEXT,
ADD COLUMN     "redirectUrl" TEXT,
ADD COLUMN     "snapToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_midtransOrderId_key" ON "Payment"("midtransOrderId");
