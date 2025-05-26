/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,size]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `size` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ItemSize" AS ENUM ('S', 'M', 'L', 'XL', 'XXL');

-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- CreateTable
CREATE TABLE "ProductSize" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" "ItemSize" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- Add size column to CartItem with default value
ALTER TABLE "CartItem" ADD COLUMN "size" "ItemSize" NOT NULL DEFAULT 'M';

-- Add size column to OrderItem with default value
ALTER TABLE "OrderItem" ADD COLUMN "size" "ItemSize" NOT NULL DEFAULT 'M';

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_size_key" ON "ProductSize"("productId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_size_key" ON "CartItem"("cartId", "productId", "size");

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the default constraints after adding the columns
ALTER TABLE "CartItem" ALTER COLUMN "size" DROP DEFAULT;
ALTER TABLE "OrderItem" ALTER COLUMN "size" DROP DEFAULT;
