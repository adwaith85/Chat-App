import express from 'express';
import { requestOTP, verifyOTP, getUserDetails, updateUser, deleteUser } from '../controller/user.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/user/request-otp', requestOTP);
router.post('/user/verify-otp', verifyOTP);

// Protected routes
router.get('/user/me', verifyToken, getUserDetails);
router.put('/user/update', verifyToken, updateUser);
router.delete('/user/delete', verifyToken, deleteUser);

export default router;
