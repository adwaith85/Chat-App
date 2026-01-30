import pool from '../db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Helper to hash OTP
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

// Request OTP
export const requestOTP = async (req, res) => {
    const { channel, contact } = req.body; // channel: 'email' or 'mobile', contact: the value

    if (!channel || !contact) {
        return res.status(400).json({ message: 'Channel and contact are required' });
    }

    try {
        // Check if user exists, if not create one
        let query = '';
        if (channel === 'email') {
            query = 'SELECT * FROM user WHERE email = ?';
        } else {
            query = 'SELECT * FROM user WHERE mobile = ?';
        }

        const [users] = await pool.execute(query, [contact]);
        let user;

        if (users.length === 0) {
            // Create new user (temporary name or ask in next step)
            const [result] = await pool.execute(
                `INSERT INTO user (name, ${channel === 'email' ? 'email' : 'mobile'}) VALUES (?, ?)`,
                ['New User', contact]
            );
            user = { id: result.insertId };
        } else {
            user = users[0];
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = hashOTP(otp);
        const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store in otpverify
        await pool.execute(
            'INSERT INTO otpverify (user_id, otp_hash, channel, expires_at) VALUES (?, ?, ?, ?)',
            [user.id, otp_hash, channel, expires_at]
        );

        // In a real app, send OTP via email/SMS here.
        // For now, we return it in the response for testing purposes.
        console.log(`OTP for ${contact}: ${otp}`);

        res.json({ message: 'OTP sent successfully', otp: otp }); // Don't return otp in production!
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error requesting OTP' });
    }
};

// Verify OTP & Login
export const verifyOTP = async (req, res) => {
    const { channel, contact, otp } = req.body;

    if (!channel || !contact || !otp) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const otp_hash = hashOTP(otp);

        // Find user
        let userQuery = channel === 'email' ? 'SELECT * FROM user WHERE email = ?' : 'SELECT * FROM user WHERE mobile = ?';
        const [users] = await pool.execute(userQuery, [contact]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Check OTP
        const [otps] = await pool.execute(
            'SELECT * FROM otpverify WHERE user_id = ? AND otp_hash = ? AND channel = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [user.id, otp_hash, channel]
        );

        if (otps.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await pool.execute('UPDATE otpverify SET is_used = TRUE WHERE id = ?', [otps[0].id]);

        // Mark user as verified if not already
        if (!user.is_verified) {
            await pool.execute('UPDATE user SET is_verified = TRUE WHERE id = ?', [user.id]);
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

// Get User Details
export const getUserDetails = async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, mobile, role, is_verified, created_at FROM user WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user details' });
    }
};

// Update User
export const updateUser = async (req, res) => {
    const { name, email, mobile } = req.body;
    try {
        await pool.execute(
            'UPDATE user SET name = COALESCE(?, name), email = COALESCE(?, email), mobile = COALESCE(?, mobile) WHERE id = ?',
            [name, email, mobile, req.user.id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or Mobile already in use' });
        }
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        await pool.execute('DELETE FROM user WHERE id = ?', [req.user.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};