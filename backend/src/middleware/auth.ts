/**
 * Authentication Middleware
 * Verifies JWT tokens from the Authorization header.
 * Attaches the decoded user ID to the request object for downstream use.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include userId from JWT
export interface AuthRequest extends Request {
    userId?: string;
}

// JWT payload structure
interface JwtPayload {
    userId: string;
    iat: number;
    exp: number;
}

/**
 * Middleware function to protect routes.
 * Extracts and verifies JWT from 'Authorization: Bearer <token>' header.
 */
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token using JWT_SECRET from environment
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret'
        ) as JwtPayload;

        // Attach userId to request for use in route handlers
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export default authMiddleware;
