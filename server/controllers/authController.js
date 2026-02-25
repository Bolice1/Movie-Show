const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { sendWelcomeEmail } = require('../utils/emails');

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

        const accessToken = generateAccessToken(user.UserId, user.UserName, user.role);
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

const resetPassword = async (req, res) => {
    const { userName, oldPassword, newPassword } = req.body;

    if (!userName || !oldPassword || !newPassword)
        return res.status(400).json({ message: 'All fields are required.' });

    try {
        // Find user by username
        const [rows] = await pool.query(
            'SELECT UserId, password FROM users WHERE UserName = ?', [userName]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'User not found.' });

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch)
            return res.status(401).json({ message: 'Old password is incorrect.' });

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = ? WHERE UserName = ?',
            [hashedPassword, userName]
        );

        return res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('resetPassword error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { register, login, refresh, logout, resetPassword };