-- DropForeignKey
ALTER TABLE "Holdings" DROP CONSTRAINT "Holdings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_holdingId_fkey";

-- AddForeignKey
ALTER TABLE "Holdings" ADD CONSTRAINT "Holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holdings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
