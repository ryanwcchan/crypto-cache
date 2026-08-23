import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Prisma 7 requires an explicit driver adapter — no bare `new PrismaClient()` like on v6
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Adding `prisma` to the NodeJS global type to prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Prevents creating new instances of Prisma Client when hot reloading in development
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
