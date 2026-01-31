import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './router/user.js';
import chatRouter from './router/chat.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRouter);
app.use('/api', chatRouter);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Chat App Backend API is running 🚀' });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
