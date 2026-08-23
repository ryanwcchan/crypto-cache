import { Request, Response } from 'express';
import generateToken from '../utils/generateToken';
import bcryptjs from 'bcryptjs';
import prisma from '../db/prisma';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Validate required fields
        if (!email || !password || !confirmPassword) {
            res.status(400).json({ error: 'Email, password, and confirmPassword are required' });
            return;
        }

        // Validate password and confirmPassword match
        if (password !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match' });
            return;
        }

        // Check for existing user with the same email
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            res.status(400).json({ error: 'User with this email already exists' });
            return;
        }
        
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword }
        })

        generateToken(newUser.id, res);
        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email } });
    } catch (error: any) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Login controller
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (!isValidPassword) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }

        generateToken(user.id, res);
        res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
