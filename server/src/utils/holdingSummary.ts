import { Prisma } from "../generated/prisma/client";
import type { Transaction } from "../generated/prisma/client";

export const calculateHoldingSummary = (transactions: Transaction[]) => {
  const sorted = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  let totalQuantity = new Prisma.Decimal(0);
  let totalCost = new Prisma.Decimal(0);

  for (const tx of sorted) {
    if (tx.type === "BUY") {
      totalQuantity = totalQuantity.plus(tx.quantity);
      totalCost = totalCost.plus(tx.quantity.times(tx.pricePerUnit));
    } else {
      // SELL: remove units at the average cost as it stood before this
      // sell, not at tx.pricePerUnit (what it sold for, not what was paid).
      const avgCostBeforeSell = totalQuantity.greaterThan(0)
        ? totalCost.dividedBy(totalQuantity)
        : new Prisma.Decimal(0);

      totalQuantity = totalQuantity.minus(tx.quantity);
      totalCost = totalCost.minus(tx.quantity.times(avgCostBeforeSell));
    }
  }

  const averageCost = totalQuantity.greaterThan(0)
    ? totalCost.dividedBy(totalQuantity)
    : new Prisma.Decimal(0);

  return {
    quantity: totalQuantity,
    averageCost,
    totalCost,
  };
};
