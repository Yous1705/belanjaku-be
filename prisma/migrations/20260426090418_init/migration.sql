/*
  Warnings:

  - You are about to drop the column `addressId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhoneNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPostal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingRecipientName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "addressId",
ADD COLUMN     "shippingAddress" TEXT NOT NULL,
ADD COLUMN     "shippingCity" TEXT NOT NULL,
ADD COLUMN     "shippingPhoneNumber" TEXT NOT NULL,
ADD COLUMN     "shippingPostal" TEXT NOT NULL,
ADD COLUMN     "shippingRecipientName" TEXT NOT NULL;
