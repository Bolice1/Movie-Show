const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const pool   = require('../config/db');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emails');

const generateAccessToken = (userId, userName, role) =>
    jwt.sign({ userId, userName, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });

const generateRefreshToken = (userId) =>
    jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });

const register = async (req, res) => {
    const { userName, firstName, lastName, email, password } = req.body;

    if (!userName || !firstName || !lastName || !email || !password)
        return res.status(400).json({ message: 'All fields are required.' });

    try {
        const [existing] = await pool.query(
            'SELECT UserId FROM users WHERE email = ? OR UserName = ?', [email, userName]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: 'Email or username already taken.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await pool.query(
            'INSERT INTO users (UserId, UserName, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, userName, firstName, lastName, email, hashedPassword]
        );

        await sendWelcomeEmail(email, userName);

        return res.status(201).json({ message: 'Account created successfully.' });
    } catch (err) {
        console.error('Register error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const [rows] = await pool.query(
            'SELECT UserId, UserName, password, role FROM users WHERE email = ?', [email]
        );
        if (rows.length === 0)
            return res.status(401).json({ message: 'Invalid email or password.' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password.' });

        const accessToken  = generateAccessToken(user.UserId, user.UserName, user.role);
        const refreshToken = generateRefreshToken(user.UserId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await pool.query(
            'INSERT INTO RefreshTokens (UserID, Token, ExpiresAt) VALUES (?, ?, ?)',
            [user.UserId, refreshToken, expiresAt]
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Login successful.',
            accessToken,
            user: { id: user.UserId, userName: user.UserName, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const refresh = async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token)
        return res.status(401).json({ message: 'No refresh token provided.' });

    try {
        const [rows] = await pool.query(
            'SELECT UserID FROM RefreshTokens WHERE Token = ? AND ExpiresAt > NOW()', [token]
        );
        if (rows.length === 0)
            return res.status(403).json({ message: 'Invalid or expired refresh token.' });

        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const [userRows] = await pool.query(
            'SELECT UserId, UserName, role FROM users WHERE UserId = ?', [decoded.userId]
        );
        if (userRows.length === 0)
            return res.status(403).json({ message: 'User not found.' });

        const newAccessToken = generateAccessToken(userRows[0].UserId, userRows[0].UserName, userRows[0].role);
        return res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('Refresh error:', err.message);
        return res.status(403).json({ message: 'Invalid refresh token.' });
    }
};

const logout = async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) return res.status(204).send();

    try {
        await pool.query('DELETE FROM RefreshTokens WHERE Token = ?', [token]);
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
        return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
        console.error('Logout error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email)
        return res.status(400).json({ message: 'Email is required.' });

    try {
        const [rows] = await pool.query(
            'SELECT UserId, UserName FROM users WHERE email = ?', [email]
        );

        if (rows.length === 0)
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

        const user = rows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await pool.query('DELETE FROM PasswordResets WHERE UserID = ?', [user.UserId]);

        await pool.query(
            'INSERT INTO PasswordResets (UserID, Token, ExpiresAt) VALUES (?, ?, ?)',
            [user.UserId, resetToken, expiresAt]
        );

        await sendPasswordResetEmail(email, user.UserName, resetToken);

        return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('forgotPassword error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword)
        return res.status(400).json({ message: 'New password is required.' });

    if (newPassword.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    try {
        const [rows] = await pool.query(
            'SELECT UserID FROM PasswordResets WHERE Token = ? AND ExpiresAt > NOW() AND Used = FALSE',
            [token]
        );

        if (rows.length === 0)
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });

        const userId = rows[0].UserID;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password = ? WHERE UserId = ?',
            [hashedPassword, userId]
        );

        await pool.query(
            'UPDATE PasswordResets SET Used = TRUE WHERE Token = ?',
            [token]
        );

        await pool.query(
            'DELETE FROM RefreshTokens WHERE UserID = ?',
            [userId]
        );

        return res.status(200).json({ message: 'Password reset successfully. Please login.' });
    } catch (err) {
        console.error('resetPassword error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const updateProfile = async (req, res) => {
    const { firstName, lastName, userName, email } = req.body;

    try {
        // Check if username or email is taken by another user
        if (userName || email) {
            const [existing] = await pool.query(
                'SELECT UserId FROM users WHERE (email = ? OR UserName = ?) AND UserId != ?',
                [email || '', userName || '', req.user.userId]
            );
            if (existing.length > 0)
                return res.status(409).json({ message: 'Email or username already taken.' });
        }

        await pool.query(`
            UPDATE users
            SET firstName = COALESCE(?, firstName),
                lastName  = COALESCE(?, lastName),
                UserName  = COALESCE(?, UserName),
                email     = COALESCE(?, email)
            WHERE UserId = ?
        `, [firstName, lastName, userName, email, req.user.userId]);

        const [rows] = await pool.query(
            'SELECT UserId, UserName, firstName, lastName, email, AccountCreationDate FROM users WHERE UserId = ?',
            [req.user.userId]
        );

        return res.status(200).json({ message: 'Profile updated successfully.', user: rows[0] });
    } catch (err) {
        console.error('updateProfile error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const deleteAccount = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE UserId = ?', [req.user.userId]);
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
        return res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (err) {
        console.error('deleteAccount error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, updateProfile,deleteAccount };