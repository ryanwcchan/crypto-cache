/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `Holdings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_holdingId_fkey";

-- AlterTable
ALTER TABLE "Holdings" ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "Transaction";
