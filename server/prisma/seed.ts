import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: "placeholder-not-a-real-hash",
    },
  });

  const btcHolding = await prisma.holdings.create({
    data: {
      coinId: "bitcoin",
      userId: user.id,
      note: "Long-term core position, DCA weekly.",
      tags: {
        create: [{ name: "long-term" }],
      },
      transactions: {
        create: [
          {
            type: "BUY",
            quantity: "0.05",
            pricePerUnit: "42000.00",
            date: new Date("2026-06-01"),
            note: "Initial buy",
          },
          {
            type: "BUY",
            quantity: "0.02",
            pricePerUnit: "45500.00",
            date: new Date("2026-07-01"),
            isRecurring: true,
          },
        ],
      },
    },
  });

  console.log("Seeded user:", user);
  console.log("Seeded holding with transactions/tags:", btcHolding);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
