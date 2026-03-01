/**
 * Notification Service
 * Core logic for scheduling, cancelling, and syncing
 * priority-based recurring task reminders using Notifee.
 */

import notifee, {
    AndroidImportance,
    AndroidVisibility,
    TimestampTrigger,
    TriggerType,
    RepeatFrequency,
} from '@notifee/react-native';
import { Task, Priority } from '../types';
import { getQuoteForCategory } from './motivationalQuotes';
import {
    saveNotificationId,
    getNotificationId,
    removeNotificationId,
    getAllNotificationEntries,
} from './notificationStorage';

const CHANNEL_ID = 'task-reminders';
const CHANNEL_NAME = 'Task Reminders';

/**
 * Priority → repeat interval in minutes.
 * In __DEV__ mode, intervals are shortened to 15 min for easier testing.
 */
const PRIORITY_INTERVALS: Record<Priority, number> = __DEV__
    ? { urgent: 15, high: 15, medium: 15, low: 15 }
    : { urgent: 60, high: 90, medium: 120, low: 180 };

/**
 * Priority emoji prefix for notification titles.
 */
const PRIORITY_EMOJI: Record<Priority, string> = {
    urgent: '🚨',
    high: '🔴',
    medium: '🟡',
    low: '🟢',
};

/**
 * Create the Android notification channel. Call once on app start.
 */
export const initNotificationChannel = async (): Promise<void> => {
    await notifee.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        vibration: true,
        sound: 'default',
    });
};

/**
 * Request notification permissions (required on Android 13+).
 */
export const requestNotificationPermission = async (): Promise<void> => {
    await notifee.requestPermission();
};

/**
 * Schedule a recurring reminder for a given task.
 * Will NOT schedule if the task is completed or the deadline has passed.
 * Cancels any existing reminder for the task before scheduling a new one.
 */
export const scheduleTaskReminder = async (task: Task): Promise<void> => {
    // Don't schedule for completed tasks
    if (task.completed) {
        return;
    }

    // Don't schedule if deadline has passed
    const deadlineDate = new Date(task.deadline);
    if (deadlineDate.getTime() <= Date.now()) {
        return;
    }

    // Cancel any existing reminder for this task first (prevents duplicates)
    await cancelTaskReminder(task._id);

    const intervalMinutes = PRIORITY_INTERVALS[task.priority] || 120;
    const emoji = PRIORITY_EMOJI[task.priority] || '📌';
    const quote = getQuoteForCategory(task.category);

    // Calculate the first trigger time (now + interval)
    const firstTriggerTime = Date.now() + intervalMinutes * 60 * 1000;

    // Don't schedule if the first trigger would be after the deadline
    if (firstTriggerTime > deadlineDate.getTime()) {
        return;
    }

    // Format deadline for display
    const deadlineStr = deadlineDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: firstTriggerTime,
        repeatFrequency: RepeatFrequency.NONE,
    };

    try {
        const notificationId = await notifee.createTriggerNotification(
            {
                title: `${emoji} Task Reminder: ${task.title}`,
                body: `⏰ Deadline: ${deadlineStr}\n💬 ${quote}`,
                android: {
                    channelId: CHANNEL_ID,
                    importance: AndroidImportance.HIGH,
                    pressAction: { id: 'default' },
                    smallIcon: 'ic_launcher',
                },
            },
            trigger,
        );

        // Store the notification ID for later cancellation
        await saveNotificationId(task._id, notificationId);

        // Schedule the next recurring notification
        scheduleNextRecurrence(task, intervalMinutes, 2, deadlineDate);
    } catch (error) {
        console.error(`Failed to schedule reminder for task ${task._id}:`, error);
    }
};

/**
 * Schedule subsequent recurring notifications up to the deadline.
 * We schedule multiple individual timestamp triggers since Notifee's
 * RepeatFrequency only supports hourly/daily/weekly on some platforms.
 */
const scheduleNextRecurrence = async (
    task: Task,
    intervalMinutes: number,
    occurrence: number,
    deadlineDate: Date,
): Promise<void> => {
    // Limit to a reasonable number of future notifications (max 50)
    const MAX_OCCURRENCES = 50;
    if (occurrence > MAX_OCCURRENCES) {
        return;
    }

    const triggerTime = Date.now() + intervalMinutes * 60 * 1000 * (occurrence - 1);

    // Stop if this occurrence would be past the deadline
    if (triggerTime > deadlineDate.getTime()) {
        return;
    }

    const emoji = PRIORITY_EMOJI[task.priority] || '📌';
    const quote = getQuoteForCategory(task.category);

    const deadlineStr = deadlineDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime,
        repeatFrequency: RepeatFrequency.NONE,
    };

    try {
        await notifee.createTriggerNotification(
            {
                id: `${task._id}_${occurrence}`,
                title: `${emoji} Task Reminder: ${task.title}`,
                body: `⏰ Deadline: ${deadlineStr}\n💬 ${quote}`,
                android: {
                    channelId: CHANNEL_ID,
                    importance: AndroidImportance.HIGH,
                    pressAction: { id: 'default' },
                    smallIcon: 'ic_launcher',
                },
            },
            trigger,
        );

        // Recursively schedule next occurrence
        await scheduleNextRecurrence(task, intervalMinutes, occurrence + 1, deadlineDate);
    } catch (error) {
        console.error(`Failed to schedule recurrence ${occurrence} for task ${task._id}:`, error);
    }
};

/**
 * Cancel all reminders for a given task.
 */
export const cancelTaskReminder = async (taskId: string): Promise<void> => {
    try {
        // Cancel primary notification
        const notificationId = await getNotificationId(taskId);
        if (notificationId) {
            await notifee.cancelNotification(notificationId);
        }

        // Cancel all recurring occurrences (they have IDs like taskId_2, taskId_3, etc.)
        const triggerIds = await notifee.getTriggerNotificationIds();
        const taskTriggerIds = triggerIds.filter(
            id => id === notificationId || id.startsWith(`${taskId}_`),
        );
        for (const id of taskTriggerIds) {
            await notifee.cancelNotification(id);
        }

        // Clean up storage
        await removeNotificationId(taskId);
    } catch (error) {
        console.error(`Failed to cancel reminder for task ${taskId}:`, error);
    }
};

/**
 * Sync all reminders with the current task list.
 * - Cancels reminders for tasks that are now completed, deleted, or past deadline
 * - Schedules reminders for active incomplete tasks that don't have one
 * This prevents duplicates and ensures consistency.
 */
export const syncAllReminders = async (tasks: Task[]): Promise<void> => {
    try {
        const storedEntries = await getAllNotificationEntries();
        const activeTaskIds = new Set(tasks.map(t => t._id));

        // Cancel reminders for tasks no longer in the list (deleted)
        for (const taskId of Object.keys(storedEntries)) {
            if (!activeTaskIds.has(taskId)) {
                await cancelTaskReminder(taskId);
            }
        }

        // Schedule/update reminders for active incomplete tasks
        for (const task of tasks) {
            if (task.completed) {
                // Cancel reminder if task is completed
                if (storedEntries[task._id]) {
                    await cancelTaskReminder(task._id);
                }
                continue;
            }

            // Cancel if deadline has passed
            const deadlineDate = new Date(task.deadline);
            if (deadlineDate.getTime() <= Date.now()) {
                if (storedEntries[task._id]) {
                    await cancelTaskReminder(task._id);
                }
                continue;
            }

            // Schedule if no existing reminder
            if (!storedEntries[task._id]) {
                await scheduleTaskReminder(task);
            }
        }
    } catch (error) {
        console.error('Failed to sync reminders:', error);
    }
};
