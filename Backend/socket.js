import { Server } from 'socket.io';
import pool from './db.js';
import jwt from 'jsonwebtoken';

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Map to keep track of user_id -> socket_id
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        let currentUserId = null;

        // Authenticate user via token
        socket.on('authenticate', async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUserId = decoded.id;

                userSockets.set(currentUserId, socket.id);
                console.log(`User ${currentUserId} authenticated`);

                // Update status in DB
                await pool.execute(
                    'INSERT INTO userstatus (user_id, is_online, last_seen) VALUES (?, TRUE, NOW()) ON DUPLICATE KEY UPDATE is_online = TRUE, last_seen = NOW()',
                    [currentUserId]
                );

                // Notify others that a user came online
                io.emit('user_status_change', { userId: currentUserId, isOnline: true });

            } catch (err) {
                console.error('Authentication failed:', err.message);
                socket.disconnect();
            }
        });

        // Join a chat session room
        socket.on('join_session', (sessionId) => {
            socket.join(`session_${sessionId}`);
            console.log(`User ${currentUserId} joined session ${sessionId}`);
        });

        // Send a message
        socket.on('send_message', async (data) => {
            const { sessionId, receiverId, message } = data;

            if (!currentUserId) return;

            try {
                // Save message to database
                const [result] = await pool.execute(
                    'INSERT INTO messages (chat_session_id, sender_id, message) VALUES (?, ?, ?)',
                    [sessionId, currentUserId, message]
                );

                const newMessage = {
                    id: result.insertId,
                    chat_session_id: sessionId,
                    sender_id: currentUserId,
                    message: message,
                    created_at: new Date()
                };

                // Broadcast to the session room
                io.to(`session_${sessionId}`).emit('new_message', newMessage);

                // Also notify the receiver if they are not in the session room (for recent chat updates)
                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message_received', newMessage);
                }

            } catch (err) {
                console.error('Error sending message:', err);
            }
        });

        // Random Matchmaking (Alternative feature)
        socket.on('find_random_match', async () => {
            if (!currentUserId) return;
            try {
                await pool.execute('INSERT IGNORE INTO matchuser (user_id) VALUES (?)', [currentUserId]);
                const [matches] = await pool.execute(
                    'SELECT user_id FROM matchuser WHERE user_id != ? ORDER BY joined_at ASC LIMIT 1',
                    [currentUserId]
                );

                if (matches.length > 0) {
                    const matchedUserId = matches[0].user_id;
                    await pool.execute('DELETE FROM matchuser WHERE user_id IN (?, ?)', [currentUserId, matchedUserId]);

                    const u1 = Math.min(currentUserId, matchedUserId);
                    const u2 = Math.max(currentUserId, matchedUserId);

                    const [sessionResult] = await pool.execute(
                        'INSERT INTO chat_sessions (user1_id, user2_id, status) VALUES (?, ?, "active") ON DUPLICATE KEY UPDATE status="active"',
                        [u1, u2]
                    );
                    const sessionId = sessionResult.insertId || (await pool.execute('SELECT id FROM chat_sessions WHERE user1_id=? AND user2_id=? AND status="active"', [u1, u2]))[0][0].id;

                    io.to(socket.id).emit('match_found', { sessionId, partnerId: matchedUserId });
                    const partnerSocketId = userSockets.get(matchedUserId);
                    if (partnerSocketId) {
                        io.to(partnerSocketId).emit('match_found', { sessionId, partnerId: currentUserId });
                    }
                }
            } catch (err) {
                console.error('Matchmaking error:', err);
            }
        });

        socket.on('disconnect', async () => {
            if (currentUserId) {
                console.log(`User ${currentUserId} disconnected`);
                userSockets.delete(currentUserId);
                try {
                    // Set offline in DB
                    await pool.execute(
                        'UPDATE userstatus SET is_online = FALSE, last_seen = NOW() WHERE user_id = ?',
                        [currentUserId]
                    );
                    // Notify others
                    io.emit('user_status_change', { userId: currentUserId, isOnline: false });
                    // Cleanup matchmaking
                    await pool.execute('DELETE FROM matchuser WHERE user_id = ?', [currentUserId]);
                } catch (err) {
                    console.error('Disconnect cleanup error:', err);
                }
            }
        });
    });

    return io;
};
