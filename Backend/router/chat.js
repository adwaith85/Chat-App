import express from 'express';
import { sendMessage, getMessages, getMessageById, updateMessage, deleteMessage, getRecentChats } from '../controller/chat.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat/send', verifyToken, sendMessage);
router.get('/chat/messages/:partner_id', verifyToken, getMessages);
router.get('/chat/message/:id', verifyToken, getMessageById);
router.put('/chat/message/:id', verifyToken, updateMessage);
router.delete('/chat/message/:id', verifyToken, deleteMessage);
router.get('/chat/recent', verifyToken, getRecentChats);

export default router;
