import pool from '../db.js';

// Get all online users (excluding self)
export const getOnlineUsers = async (req, res) => {
    const userId = req.user.id;
    try {
        const [users] = await pool.execute(
            `SELECT u.id, u.name, u.email, us.is_online, us.last_seen 
       FROM user u 
       JOIN userstatus us ON u.id = us.user_id 
       WHERE us.is_online = TRUE AND u.id != ?`,
            [userId]
        );
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching online users' });
    }
};

// Get or Create Chat Session between two users
export const getOrCreateSession = async (req, res) => {
    const user1_id = req.user.id;
    const { user2_id } = req.body;

    if (!user2_id) {
        return res.status(400).json({ message: 'Target user ID is required' });
    }

    try {
        // Ensure user1_id < user2_id for unique constraint
        const u1 = Math.min(user1_id, user2_id);
        const u2 = Math.max(user1_id, user2_id);

        // Check if active session exists
        const [sessions] = await pool.execute(
            'SELECT id FROM chat_sessions WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) AND status = "active"',
            [u1, u2, u2, u1]
        );

        if (sessions.length > 0) {
            return res.json({ sessionId: sessions[0].id });
        }

        // Create new session
        const [result] = await pool.execute(
            'INSERT INTO chat_sessions (user1_id, user2_id, status) VALUES (?, ?, "active")',
            [u1, u2]
        );

        res.json({ sessionId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating chat session' });
    }
};

// Get Chat History for a session
export const getChatHistory = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const [messages] = await pool.execute(
            `SELECT m.*, u.name as sender_name 
       FROM messages m 
       JOIN user u ON m.sender_id = u.id 
       WHERE m.chat_session_id = ? 
       ORDER BY m.created_at ASC`,
            [sessionId]
        );
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
};

// Get all recent chats for the user
export const getRecentChats = async (req, res) => {
    const userId = req.user.id;
    try {
        const [chats] = await pool.execute(
            `SELECT cs.id as sessionId, cs.status, u.id as partnerId, u.name as partnerName, 
              (SELECT message FROM messages WHERE chat_session_id = cs.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
              (SELECT created_at FROM messages WHERE chat_session_id = cs.id ORDER BY created_at DESC LIMIT 1) as lastMessageTime
       FROM chat_sessions cs
       JOIN user u ON (cs.user1_id = u.id OR cs.user2_id = u.id)
       WHERE (cs.user1_id = ? OR cs.user2_id = ?) AND u.id != ?
       ORDER BY lastMessageTime DESC`,
            [userId, userId, userId]
        );
        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recent chats' });
    }
};
