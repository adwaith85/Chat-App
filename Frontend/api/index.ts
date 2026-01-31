import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your local machine's IP address for physical device testing
// For simulator, http://localhost:3000 or http://10.0.2.2:3000 (android) works
const BASE_URL = 'http://192.168.33.90/api'; // Updated with local IP for connectivity

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    requestOTP: (channel: string, contact: string) =>
        api.post('/user/request-otp', { channel, contact }),

    verifyOTP: (channel: string, contact: string, otp: string) =>
        api.post('/user/verify-otp', { channel, contact, otp }),

    getMe: () => api.get('/user/me'),

    updateProfile: (data: { name?: string, email?: string, mobile?: string }) =>
        api.put('/user/update', data),
};

export default api;
