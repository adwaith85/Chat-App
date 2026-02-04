import pool from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Request OTP
export const requestOTP = async (req, res) => {
    const { number } = req.body;

    if (!number) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        // Check if user exists, if not create one
        const [users] = await pool.execute('SELECT * FROM users WHERE number = ?', [number]);
        let user;

        if (users.length === 0) {
            const [result] = await pool.execute(
                'INSERT INTO users (number) VALUES (?)',
                [number]
            );
            user = { user_id: result.insertId };
        } else {
            user = users[0];
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in users table
        await pool.execute(
            'UPDATE users SET otp = ?, otp_expires_at = ? WHERE user_id = ?',
            [otp, expires_at, user.user_id]
        );

        // For testing purposes, return the OTP
        console.log(`OTP for ${number}: ${otp}`);
        res.json({ message: 'OTP sent successfully', otp: otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error requesting OTP' });
    }
};

// Verify OTP & Login
export const verifyOTP = async (req, res) => {
    const { number, otp } = req.body;

    if (!number || !otp) {
        return res.status(400).json({ message: 'Number and OTP are required' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE number = ? AND otp = ? AND otp_expires_at > NOW()',
            [number, otp]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = users[0];

        // Clear OTP and set verified
        await pool.execute(
            'UPDATE users SET otp = NULL, otp_expires_at = NULL, is_verified = 1, is_online = 1, last_seen = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // Generate JWT
        const token = jwt.sign(
            { id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                number: user.number,
                email: user.email,
                profile_image: user.profile_image,
                is_verified: 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

// Get All Users
export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT user_id, number, email, profile_image, is_online, last_seen, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get Single User Details
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.execute('SELECT user_id, number, email, profile_image, is_online, last_seen, created_at FROM users WHERE user_id = ?', [id]);
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
    const { email, profile_image } = req.body;
    const userId = req.user.id;
    try {
        await pool.execute(
            'UPDATE users SET email = COALESCE(?, email), profile_image = COALESCE(?, profile_image) WHERE user_id = ?',
            [email, profile_image, userId]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    // Allow users to delete themselves or admin (if we had roles, for now let's say only self or by id if allowed)
    // To keep it simple as requested "get post put delete for everything"
    try {
        await pool.execute('DELETE FROM users WHERE user_id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};