const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/authMiddleware');

// All watchlist routes are protected
router.get('/', authenticate, getWatchlist);
router.post('/', authenticate, addToWatchlist);
router.delete('/:contentId', authenticate, removeFromWatchlist);

module.exports = router;