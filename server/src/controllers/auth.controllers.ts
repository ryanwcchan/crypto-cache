import { Request, Response } from "express";
import generateToken from "../utils/generateToken";
import bcryptjs from "bcryptjs";
import prisma from "../db/prisma";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "Email, password, and confirmPassword are required" });
    }

    // Validate password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check for existing user with the same email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    generateToken(newUser.id, res);
    return res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error: any) {
    console.error("Error during signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    generateToken(user.id, res);
    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error: any) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// CRUD operations for users
export const addCoin = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { coin } = req.body;

    if (!userId || !coin) {
      return res.status(400).json({ error: "User ID and coin are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }
  } catch (error: any) {
    console.error("Error adding coin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
