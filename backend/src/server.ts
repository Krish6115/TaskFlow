/**
 * Server Entry Point
 * Sets up Express server with MongoDB connection, CORS, and route mounting.
 * Loads environment variables from .env file.
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo_app';

// --- Middleware ---

// Parse JSON request bodies
app.use(express.json());

// Enable CORS for React Native app (allows requests from any origin during development)
app.use(cors());

// --- Routes ---

// Authentication routes (register, login)
app.use('/api/auth', authRoutes);

// Task CRUD routes (protected by auth middleware)
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Database Connection & Server Start ---

/**
 * Connect to MongoDB and start the Express server.
 * Uses mongoose for connection management with retry logic.
 */
const startServer = async (): Promise<void> => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB successfully!');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 API endpoints:`);
            console.log(`   POST /api/auth/register`);
            console.log(`   POST /api/auth/login`);
            console.log(`   GET  /api/tasks`);
            console.log(`   POST /api/tasks`);
            console.log(`   PUT  /api/tasks/:id`);
            console.log(`   DELETE /api/tasks/:id`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

startServer();
