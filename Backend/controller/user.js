import pool from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { transporter } from '../mailer.js';
dotenv.config();

// Request OTP - Login/Signup start
export const requestOTP = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // check if user exists
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length > 0) {
            // update OTP for existing user
            await pool.query(
                `UPDATE users 
         SET otp = ?, otp_expires_at = ? 
         WHERE email = ?`,
                [otp, otpExpiry, email]
            );
        } else {
            // create new user with OTP and optional name
            await pool.query(
                `INSERT INTO users (email, name, otp, otp_expires_at) 
         VALUES (?, ?, ?, ?)`,
                [email, name || null, otp, otpExpiry]
            );
        }

        // TODO: send OTP via Email gateway. For now, just log it.
        console.log(`OTP for ${email}: ${otp}`);


        transporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>OTP Verification</h2>
                    <p>Your OTP is:</p>
                    <h1 style="letter-spacing: 3px;">${otp}</h1>
                    <p>This OTP will expire in <b>5 minutes</b>.</p>
                </div>
            `,
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",

        });

    } catch (error) {
        console.error("Error in requestOTP:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Verify OTP - Login/Signup complete
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Number and OTP required" });
        }

        const [users] = await pool.query(
            `SELECT * FROM users 
       WHERE email = ? 
       AND otp = ? 
       AND otp_expires_at >= NOW()`,
            [email, otp]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        const user = users[0];

        // Mark user as verified and online
        await pool.query(
            `UPDATE users 
       SET otp = NULL,
           otp_expires_at = NULL,
           is_verified = 'yes',
           is_online = 'online'
       WHERE user_id = ?`,
            [user.user_id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                is_verified: 'yes',
                profile_image: user.profile_image
            }
        });

    } catch (error) {
        console.error("Error in verifyOTP:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get current logged in user details
export const getMe = async (req, res) => {
    try {
        const user_id = req.user.user_id; // From verifyToken middleware

        const [users] = await pool.query(
            `SELECT user_id, number, name, email, profile_image, is_online, last_seen, created_at 
       FROM users WHERE user_id = ?`,
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Logout
export const Logout = async (req, res) => {
    try {
        const user_id = req.user.user_id; // From verifyToken middleware

        await pool.query(
            `UPDATE users 
       SET is_online = 'offline', last_seen = NOW() 
       WHERE user_id = ?`,
            [user_id]
        );

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        console.error("Error in Logout:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT 
        user_id,
        number,
        name,
        email,
        profile_image,
        is_online,
        last_seen,
        created_at
       FROM users`
        );

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Error in getUsers:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get single user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query(
            `SELECT 
        user_id,
        number,
        name,
        email,
        profile_image,
        is_online,
        last_seen,
        created_at
       FROM users
       WHERE user_id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Error in getUserById:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update profile details
export const updateUser = async (req, res) => {
    try {
        const user_id = req.user.user_id; // Usually we update the logged in user's profile
        let { name, number } = req.body;

        let profile_image = req.body.profile_image;

        // If a file was uploaded, use the generated path
        if (req.file) {
            profile_image = `uploads/${req.file.filename}`;
        }

        // Build the update query dynamically based on what's provided
        let fields = [];
        let values = [];

        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }

        if (number !== undefined) {
            fields.push('number = ?');
            values.push(number);
        }

        if (profile_image !== undefined) {
            fields.push('profile_image = ?');
            values.push(profile_image);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        values.push(user_id);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;

        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch updated user to return
        const [updatedUser] = await pool.query(
            "SELECT user_id, number, name, email, profile_image FROM users WHERE user_id = ?",
            [user_id]
        );

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser[0]
        });

    } catch (error) {
        console.error("Error in updateUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete user account
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM users WHERE user_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};