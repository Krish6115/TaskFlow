/**
 * Notification Storage Service
 * Persists notification IDs mapped to task IDs in AsyncStorage
 * so we can cancel reminders when tasks are completed or deleted.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@task_notification_ids';

type NotificationMap = Record<string, string>;

/**
 * Load the full notification map from storage.
 */
const loadMap = async (): Promise<NotificationMap> => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Persist the full notification map to storage.
 */
const saveMap = async (map: NotificationMap): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (error) {
        console.error('Failed to save notification map:', error);
    }
};

/**
 * Save a notification ID for a given task.
 */
export const saveNotificationId = async (
    taskId: string,
    notificationId: string,
): Promise<void> => {
    const map = await loadMap();
    map[taskId] = notificationId;
    await saveMap(map);
};

/**
 * Get the notification ID for a given task.
 */
export const getNotificationId = async (
    taskId: string,
): Promise<string | null> => {
    const map = await loadMap();
    return map[taskId] || null;
};

/**
 * Remove the notification ID for a given task.
 */
export const removeNotificationId = async (
    taskId: string,
): Promise<void> => {
    const map = await loadMap();
    delete map[taskId];
    await saveMap(map);
};

/**
 * Get all stored notification entries.
 */
export const getAllNotificationEntries = async (): Promise<NotificationMap> => {
    return loadMap();
};

/**
 * Clear all stored notification IDs.
 */
export const clearAllNotificationIds = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear notification map:', error);
    }
};
