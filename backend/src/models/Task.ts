/**
 * Task Model
 * Defines the schema for task documents in MongoDB.
 * Each task is linked to a user via the userId field.
 * Supports title, description, dateTime, deadline, priority, category, and completion status.
 */

import mongoose, { Document, Schema } from 'mongoose';

// Priority levels for tasks
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Interface for Task document
export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dateTime: Date;
    deadline: Date;
    priority: Priority;
    category: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Task schema definition
const TaskSchema: Schema<ITask> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        dateTime: {
            type: Date,
            default: Date.now,
        },
        deadline: {
            type: Date,
            required: [true, 'Deadline is required'],
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        category: {
            type: String,
            trim: true,
            default: 'General',
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true,
    }
);

// Index for efficient querying by user
TaskSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ITask>('Task', TaskSchema);
