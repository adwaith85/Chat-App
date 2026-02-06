import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/Config';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error fetching token from storage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add interceptor to handle response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // Hard redirect to login/landing
            // Note: In React Native, we can't easily trigger a navigation from here 
            // without a reference to the router, but the _layout.tsx checkAuth will catch this.
        }
        return Promise.reject(error);
    }
);

/**
 * Authentication related API calls
 */
export const authApi = {
    requestOTP: (number: string) =>
        api.post('/user/request-otp', { number }),

    verifyOTP: (number: string, otp: string) =>
        api.post('/user/verify-otp', { number, otp }),

    logout: () =>
        api.post('/user/logout'),
};

/**
 * User and Profile related API calls
 */
export const userApi = {
    getMe: () =>
        api.get('/user/me'),

    getUsers: () =>
        api.get('/users'),

    getUserById: (id: string | number) =>
        api.get(`/user/${id}`),

    updateProfile: (data: FormData | any) =>
        api.put('/user/update', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    deleteAccount: (id: string | number) =>
        api.delete(`/user/${id}`),
};

/**
 * Chat and Messaging related API calls
 */
export const chatApi = {
    sendMessage: (data: { receiver_id: number, message: string, message_type?: string }) =>
        api.post('/api/chat/send', data),

    getMessages: (partner_id: number | string) =>
        api.get(`/api/chat/messages/${partner_id}`),

    getRecentChats: () =>
        api.get('/api/chat/recent'),

    getMessageById: (id: number | string) =>
        api.get(`/api/chat/message/${id}`),

    updateMessageStatus: (id: number | string, status: 'delivered' | 'read') =>
        api.put(`/api/chat/message/${id}`, { status }),

    deleteMessage: (id: number | string) =>
        api.delete(`/api/chat/message/${id}`),
};

export default api;
