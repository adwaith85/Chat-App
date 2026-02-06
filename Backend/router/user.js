import express from 'express';
import {
    requestOTP,
    verifyOTP,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMe,
    Logout
} from '../controller/user.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Auth routes
router.post('/user/request-otp', requestOTP);
router.post('/user/verify-otp', verifyOTP);
router.post('/user/logout', verifyToken, Logout);

// User Profile routes
router.get('/user/me', verifyToken, getMe);
router.put('/user/update', verifyToken, upload.single('profile_image'), updateUser);

// Admin/General User Management (You might want to restrict these)
router.get('/users', verifyToken, getUsers);
router.get('/user/:id', verifyToken, getUserById);
router.delete('/user/:id', verifyToken, deleteUser);

export default router;
