const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token)
        return res.status(401).json({ message: 'Access token required.' });

    try {
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired access token.' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const pool = require('../config/db');
        const [rows] = await pool.query(
            'SELECT role FROM users WHERE UserId = ?', [req.user.userId]
        );
        if (rows.length === 0 || rows[0].role !== 'admin')
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { authenticate, isAdmin };