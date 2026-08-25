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
    const { coinId, quantity } = req.body;

    if (!coinId || typeof quantity !== "number" || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Coin ID and a positive quantity are required" });
    }

    const newHolding = await prisma.holdings.create({
      data: {
        coinId,
        quantity,
        userId,
      },
    });

    return res
      .status(201)
      .json({ message: "Coin added to holdings", newHolding });
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
