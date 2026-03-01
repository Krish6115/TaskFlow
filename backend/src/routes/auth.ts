/**
 * Authentication Routes
 * Handles user registration and login.
 * POST /api/auth/register - Create a new user account
 * POST /api/auth/login - Authenticate and receive JWT token
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

/**
 * POST /api/auth/register
 * Creates a new user with email and password.
 * Returns a JWT token on successful registration.
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email and password are required.' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: 'Password must be at least 6 characters.' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ message: 'An account with this email already exists.' });
            return;
        }

        // Create new user (password is hashed by pre-save middleware)
        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' } // Token expires in 7 days
        );

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

/**
 * POST /api/auth/login
 * Authenticates a user with email and password.
 * Returns a JWT token on successful login.
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        // Verify password using the model's comparePassword method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

export default router;
