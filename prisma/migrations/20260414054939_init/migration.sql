-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountExpiry" TIMESTAMP(3),
ADD COLUMN     "discountPrice" DECIMAL(65,30),
ADD COLUMN     "isDiscount" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProductWeeklyStats" (
    "id" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductWeeklyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductWeeklyStats_productId_key" ON "ProductWeeklyStats"("productId");

-- AddForeignKey
ALTER TABLE "ProductWeeklyStats" ADD CONSTRAINT "ProductWeeklyStats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
