import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "../generated/prisma/client";
import { calculateHoldingSummary } from "../utils/holdingSummary";

export const addCoin = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const userId = req.user.id;
    const { coinId, quantity, pricePerUnit, date } = req.body;

    if (!coinId || typeof quantity !== "number" || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Coin ID and a positive quantity are required" });
    }

    let transactionDate = new Date();
    if (date !== undefined) {
      transactionDate = new Date(date);
      if (isNaN(transactionDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
    }

    const [newHolding, transaction] = await prisma.$transaction(async (tx) => {
      const newHolding = await tx.holdings.upsert({
        where: { userId_coinId: { userId, coinId } },
        update: {},
        create: { userId, coinId },
      });

      const transaction = await tx.transaction.create({
        data: {
          holdingId: newHolding.id,
          type: "BUY",
          quantity,
          pricePerUnit,
          date: transactionDate,
        },
      });

      return [newHolding, transaction] as const;
    });

    return res
      .status(201)
      .json({ message: "Coin added to holdings", newHolding, transaction });
  } catch (error: any) {
    console.error("Error adding coin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getHoldings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const userId = req.user.id;

    const holdings = await prisma.holdings.findMany({
      where: {
        userId,
      },
      include: {
        transactions: true,
      },
    });

    const holdingsWithSummary = holdings.map((holding) => ({
      ...holding,
      ...calculateHoldingSummary(holding.transactions),
    }));

    return res.status(200).json({ holdings: holdingsWithSummary });
  } catch (error: any) {
    console.error("Error fetching holdings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const userId = req.user.id;
    const { holdingId } = req.params as { holdingId: string };

    const holding = await prisma.holdings.findFirst({
      where: { id: holdingId, userId },
    });

    if (!holding) {
      return res.status(404).json({ error: "Holding not found" });
    }

    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string, 10) || 20, 1),
      100,
    );

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { holdingId },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: { holdingId } }),
    ]);

    return res.status(200).json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching transactions", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteHolding = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const userId = req.user.id;
    const { holdingId } = req.params as { holdingId: string };

    if (!holdingId) {
      return res.status(400).json({ error: "Holding ID required" });
    }

    await prisma.holdings.deleteMany({
      where: {
        userId,
        id: holdingId,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfully deleted ", holdingId });
  } catch (error: any) {
    console.error("Error deleting holding:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateHolding = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const userId = req.user.id;
    const { holdingId } = req.params as { holdingId: string };
    const { note, addTagIds, removeTagIds } = req.body;

    if (!holdingId) {
      return res.status(400).json({ error: "Holding ID required" });
    }

    const existingHolding = await prisma.holdings.findFirst({
      where: { id: holdingId, userId },
    });

    if (!existingHolding) {
      return res.status(404).json({ error: "Holding not found" });
    }

    const updatedHolding = await prisma.holdings.update({
      where: { id: holdingId },
      data: {
        note,
        tags: {
          ...(addTagIds?.length && {
            connect: addTagIds.map((id: string) => ({ id })),
          }),
          ...(removeTagIds?.length && {
            disconnect: removeTagIds.map((id: string) => ({ id })),
          }),
        },
      },
      include: { tags: true },
    });

    return res.status(200).json({ message: "Holding updated", updatedHolding });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res
        .status(400)
        .json({ error: "One or more tag IDs do not exist" });
    }

    console.error("Error updating holding:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
