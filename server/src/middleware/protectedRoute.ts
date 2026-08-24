import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import { Response, Request, NextFunction } from "express";

const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: "Unauthorized - User not found" });
    }

    req.user = { id: user.id };
    next();
  } catch (error: any) {
    console.error("Error in protectRoute middleware", error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

export default protectRoute;
