import jwt from 'jsonwebtoken';
import { Response } from 'express';

const jwtExpiresIn = '7';

const generateToken = (id: string, res: Response) => {
    const jwtSECRET = process.env.JWT_SECRET;
    if (!jwtSECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign({ id }, jwtSECRET, {
        expiresIn: `${jwtExpiresIn}d`
    })

    res.cookie("jwt", token, {
        maxAge: parseInt(jwtExpiresIn, 10) * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production'
    })
}

export default generateToken;