/**
 * Task Routes
 * CRUD operations for tasks, all protected by auth middleware.
 * GET    /api/tasks       - List all tasks for the authenticated user (with sorting/filtering)
 * POST   /api/tasks       - Create a new task
 * PUT    /api/tasks/:id   - Update a task (edit fields or toggle completion)
 * DELETE /api/tasks/:id   - Delete a task
 */

import { Router, Response } from 'express';
import Task from '../models/Task';
import authMiddleware, { AuthRequest } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

/**
 * GET /api/tasks
 * Retrieves all tasks for the authenticated user.
 * Supports query params:
 *   - sortBy: 'priority' | 'deadline' | 'dateTime' | 'mixed' (default: 'mixed')
 *   - filterCategory: string (filter by category name)
 *   - filterCompleted: 'true' | 'false' (filter by completion status)
 *   - filterPriority: 'low' | 'medium' | 'high' | 'urgent'
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sortBy, filterCategory, filterCompleted, filterPriority } = req.query;

        // Build query filter
        const filter: any = { userId: req.userId };

        if (filterCategory) {
            filter.category = filterCategory;
        }
        if (filterCompleted !== undefined && filterCompleted !== '') {
            filter.completed = filterCompleted === 'true';
        }
        if (filterPriority) {
            filter.priority = filterPriority;
        }

        // Fetch tasks from database
        let tasks = await Task.find(filter).lean();

        /**
         * Sorting Algorithm
         * 'mixed' mode uses a weighted scoring system:
         *   score = priorityWeight * 3 + deadlineUrgency * 2 + recency * 1
         * This ensures urgent tasks with close deadlines appear first.
         */
        const priorityWeights: Record<string, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
        };

        switch (sortBy) {
            case 'priority':
                // Sort by priority weight (highest first)
                tasks.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
                break;

            case 'deadline':
                // Sort by deadline (earliest first)
                tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                break;

            case 'dateTime':
                // Sort by creation dateTime (newest first)
                tasks.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
                break;

            case 'mixed':
            default:
                // Mixed sorting algorithm combining priority, deadline urgency, and recency
                const now = Date.now();
                tasks.sort((a, b) => {
                    // Priority score (0-4, higher = more important)
                    const aPriority = priorityWeights[a.priority] || 0;
                    const bPriority = priorityWeights[b.priority] || 0;

                    // Deadline urgency score (higher = more urgent, based on hours until deadline)
                    const aDeadlineHours = Math.max(0, (new Date(a.deadline).getTime() - now) / 3600000);
                    const bDeadlineHours = Math.max(0, (new Date(b.deadline).getTime() - now) / 3600000);
                    // Normalize: tasks due within 24h get max urgency, tasks > 7 days get min
                    const aUrgency = Math.max(0, 4 - (aDeadlineHours / 42)); // 42h = ~1.75 days for mid score
                    const bUrgency = Math.max(0, 4 - (bDeadlineHours / 42));

                    // Recency score (newer tasks score slightly higher)
                    const aRecency = new Date(a.dateTime).getTime() / now;
                    const bRecency = new Date(b.dateTime).getTime() / now;

                    // Weighted composite score
                    const aScore = aPriority * 3 + aUrgency * 2 + aRecency * 1;
                    const bScore = bPriority * 3 + bUrgency * 2 + bRecency * 1;

                    // Completed tasks always go to the bottom
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;

                    return bScore - aScore; // Higher score first
                });
                break;
        }

        res.status(200).json({ tasks });
    } catch (error: any) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error while fetching tasks.' });
    }
});

/**
 * POST /api/tasks
 * Creates a new task for the authenticated user.
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, dateTime, deadline, priority, category } = req.body;

        // Validate required fields
        if (!title) {
            res.status(400).json({ message: 'Task title is required.' });
            return;
        }
        if (!deadline) {
            res.status(400).json({ message: 'Task deadline is required.' });
            return;
        }

        // Create task with the authenticated user's ID
        const task = new Task({
            userId: req.userId,
            title,
            description: description || '',
            dateTime: dateTime || new Date(),
            deadline,
            priority: priority || 'medium',
            category: category || 'General',
        });

        await task.save();

        res.status(201).json({
            message: 'Task created successfully!',
            task,
        });
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error while creating task.' });
    }
});

/**
 * PUT /api/tasks/:id
 * Updates an existing task. Can update any field including toggling completion.
 * Only the task owner can update their tasks.
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find task and verify ownership
        const task = await Task.findOne({ _id: id, userId: req.userId });
        if (!task) {
            res.status(404).json({ message: 'Task not found.' });
            return;
        }

        // Apply updates to the task
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Task updated successfully!',
            task: updatedTask,
        });
    } catch (error: any) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error while updating task.' });
    }
});

/**
 * DELETE /api/tasks/:id
 * Deletes a task. Only the task owner can delete their tasks.
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find and delete task, ensuring the user owns it
        const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
        if (!task) {
            res.status(404).json({ message: 'Task not found.' });
            return;
        }

        res.status(200).json({ message: 'Task deleted successfully!' });
    } catch (error: any) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error while deleting task.' });
    }
});

export default router;
