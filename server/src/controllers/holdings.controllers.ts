import { Request, Response } from "express";
import prisma from "../db/prisma";

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

    const newHolding = await prisma.holdings.upsert({
      where: { userId_coinId: { userId, coinId } },
      update: {},
      create: { userId, coinId },
    });

    await prisma.transaction.create({
      data: {
        holdingId: newHolding.id,
        type: "BUY",
        quantity,
        pricePerUnit,
        date: transactionDate,
      },
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
    });

    return res.status(200).json({ holdings });
  } catch (error: any) {
    console.error("Error fetching holdings:", error);
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
  } catch (error: any) {
    console.error("Error updating holding:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
