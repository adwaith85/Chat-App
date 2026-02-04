import express from 'express';
import { requestOTP, verifyOTP, getUsers, getUserById, updateUser, deleteUser } from '../controller/user.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/user/request-otp', requestOTP);
router.post('/user/verify-otp', verifyOTP);

// User CRUD routes
router.get('/users', verifyToken, getUsers);
router.get('/user/:id', verifyToken, getUserById);
router.put('/user/update', verifyToken, updateUser);
router.delete('/user/:id', verifyToken, deleteUser);

export default router;
