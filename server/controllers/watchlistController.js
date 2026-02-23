const pool = require('../config/db');

// GET /api/watchlist — get current user's watchlist
const getWatchlist = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                w.listID, c.ContentID, c.Title, 
                c.Description, c.Duration, c.Type,
                GROUP_CONCAT(DISTINCT g.GenreName) AS genres
            FROM WatchLists w
            JOIN content c ON w.ContentID = c.ContentID
            LEFT JOIN Content_Genre cg ON c.ContentID = cg.ContentID
            LEFT JOIN Genre g ON cg.GenreID = g.GenreID
            WHERE w.UserID = ?
            GROUP BY w.listID
        `, [req.user.userId]);

        return res.status(200).json({ watchlist: rows });
    } catch (err) {
        console.error('getWatchlist error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/watchlist — add content to watchlist
const addToWatchlist = async (req, res) => {
    const { contentId } = req.body;

    if (!contentId)
        return res.status(400).json({ message: 'contentId is required.' });

    try {
        // Check content exists
        const [content] = await pool.query(
            'SELECT ContentID FROM content WHERE ContentID = ?', [contentId]
        );
        if (content.length === 0)
            return res.status(404).json({ message: 'Content not found.' });

        // Add to watchlist
        await pool.query(
            'INSERT INTO WatchLists (UserID, ContentID) VALUES (?, ?)',
            [req.user.userId, contentId]
        );

        return res.status(201).json({ message: 'Added to watchlist.' });
    } catch (err) {
        // Duplicate entry means already in watchlist
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Already in watchlist.' });
        console.error('addToWatchlist error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/watchlist/:contentId — remove from watchlist
const removeFromWatchlist = async (req, res) => {
    const { contentId } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM WatchLists WHERE UserID = ? AND ContentID = ?',
            [req.user.userId, contentId]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Item not found in watchlist.' });

        return res.status(200).json({ message: 'Removed from watchlist.' });
    } catch (err) {
        console.error('removeFromWatchlist error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };