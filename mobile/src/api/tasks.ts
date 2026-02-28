/**
 * Task API Functions
 * Full CRUD operations with sorting/filtering support.
 */

import apiClient from './client';
import {
    TasksResponse,
    TaskResponse,
    CreateTaskData,
    UpdateTaskData,
    TaskQueryParams,
} from '../types';

export const getTasks = async (
    params?: TaskQueryParams,
): Promise<TasksResponse> => {
    const response = await apiClient.get<TasksResponse>('/tasks', { params });
    return response.data;
};

export const createTask = async (
    data: CreateTaskData,
): Promise<TaskResponse> => {
    const response = await apiClient.post<TaskResponse>('/tasks', data);
    return response.data;
};

export const updateTask = async (
    id: string,
    data: UpdateTaskData,
): Promise<TaskResponse> => {
    const response = await apiClient.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data;
};

export const deleteTask = async (
    id: string,
): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
};
