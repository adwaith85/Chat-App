import express from 'express';
import { getOnlineUsers, getOrCreateSession, getChatHistory, getRecentChats } from '../controller/chat.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/chat/online-users', verifyToken, getOnlineUsers);
router.post('/chat/session', verifyToken, getOrCreateSession);
router.get('/chat/history/:sessionId', verifyToken, getChatHistory);
router.get('/chat/recent', verifyToken, getRecentChats);

export default router;
