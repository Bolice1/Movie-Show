const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, forgotPassword, resetPassword, updateProfile,deleteAccount } = require('../controllers/authController');

const { authenticate } = require('../middleware/authMiddleware');

router.put('/profile',    authenticate, updateProfile);
router.delete('/profile', authenticate, deleteAccount);
router.put('/profile', authenticate, updateProfile);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

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