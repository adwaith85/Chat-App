import express from 'express';
import fs from 'fs';
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
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use('/uploads', express.static('uploads'));

// Routes
app.use("/", userRouter);
app.use('/api', chatRouter);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Chat App Backend API is running 🚀' });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
