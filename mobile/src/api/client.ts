/**
 * Axios HTTP Client
 * Pre-configured with base URL and JWT token interceptor.
 * Uses 10.0.2.2 to reach host localhost from Android emulator.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use local backend for emulators, Production cloud backend for real devices
const getBaseUrl = () => {
    if (__DEV__) {
        return Platform.OS === 'android'
            ? 'http://10.0.2.2:5000/api'
            : 'http://localhost:5000/api';
    }
    // Production cloud backend (Render)
    return 'https://my-to-do-app-r-backend.onrender.com/api';
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token from AsyncStorage
apiClient.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error),
);

// Response interceptor — handle 401 errors
apiClient.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear stored auth
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    },
);

export default apiClient;
