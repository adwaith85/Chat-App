import pool from '../db.js';
import { getIO, getUserSocket } from '../socket.js';

// Send Message
export const sendMessage = async (req, res) => {
    const { receiver_id, message, message_type } = req.body;
    const sender_id = req.user.user_id;

    if (!receiver_id || (!message && message_type === 'text')) {
        return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, message, message_type) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, message || null, message_type || 'text']
        );

        const newMessage = {
            message_id: result.insertId,
            sender_id,
            receiver_id,
            message,
            message_type: message_type || 'text',
            status: 'sent',
            sent_at: new Date()
        };

        // Emit socket event for real-time delivery
        try {
            const io = getIO();
            const receiverSocketId = getUserSocket(receiver_id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', newMessage);
            }
        } catch (socketError) {
            console.error('Socket emission failed in sendMessage:', socketError.message);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// Get Messages between two users
export const getMessages = async (req, res) => {
    const { partner_id } = req.params;
    const userId = req.user.user_id;

    try {
        const [messages] = await pool.execute(
            `SELECT * FROM messages 
             WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
             AND is_deleted = 0
             ORDER BY sent_at ASC`,
            [userId, partner_id, partner_id, userId]
        );
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Get Single Message By ID
export const getMessageById = async (req, res) => {
    const { id } = req.params;
    try {
        const [messages] = await pool.execute('SELECT * FROM messages WHERE message_id = ?', [id]);
        if (messages.length === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json(messages[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching message' });
    }
};

// Update Message (e.g., status to 'read')
export const updateMessage = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        let updateQuery = 'UPDATE messages SET status = ?';
        const params = [status];

        if (status === 'delivered') {
            updateQuery += ', delivered_at = NOW()';
        } else if (status === 'read') {
            updateQuery += ', read_at = NOW()';
        }

        updateQuery += ' WHERE message_id = ?';
        params.push(id);

        await pool.execute(updateQuery, params);
        res.json({ message: 'Message updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating message' });
    }
};

// Delete Message (Soft Delete)
export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('UPDATE messages SET is_deleted = 1 WHERE message_id = ?', [id]);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message' });
    }
};

// Get Recent Chats (List of users chatted with)
export const getRecentChats = async (req, res) => {
    const userId = req.user.user_id;

    try {
        // This query finds the latest message for each contact the user has interacted with
        const [chats] = await pool.execute(
            `SELECT 
                u.user_id, 
                u.number, 
                u.email, 
                u.profile_image, 
                u.is_online,
                m.message as last_message, 
                m.sent_at as last_message_time,
                m.status as last_message_status
             FROM users u
             JOIN messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id)
             WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.user_id != ?
             AND m.sent_at = (
                SELECT MAX(sent_at) 
                FROM messages 
                WHERE (sender_id = ? AND receiver_id = u.user_id) 
                   OR (sender_id = u.user_id AND receiver_id = ?)
             )
             ORDER BY m.sent_at DESC`,
            [userId, userId, userId, userId, userId]
        );
        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recent chats' });
    }
};
