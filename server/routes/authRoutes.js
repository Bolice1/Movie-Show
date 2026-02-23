const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected route — requires valid access token
router.get('/me', authenticate, async (req, res) => {
    const pool = require('../config/db');
    const [rows] = await pool.query(
        'SELECT UserId, UserName, firstName, lastName, email, AccountCreationDate FROM users WHERE UserId = ?',
        [req.user.userId]
    );
    if (rows.length === 0)
        return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ user: rows[0] });
});

module.exports = router;