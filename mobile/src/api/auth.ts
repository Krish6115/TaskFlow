/**
 * Authentication API Functions
 */

import apiClient from './client';
import { LoginResponse, RegisterResponse } from '../types';

export const loginUser = async (
    email: string,
    password: string,
): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
    });
    return response.data;
};

export const registerUser = async (
    name: string,
    email: string,
    password: string,
): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
        name,
        email,
        password,
    });
    return response.data;
};
