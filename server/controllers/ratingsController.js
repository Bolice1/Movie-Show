const pool = require('../config/db');

// GET /api/ratings/:contentId — get all ratings for content
const getRatings = async (req, res) => {
    const { contentId } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT r.RatingID, r.RatingScore, r.Comment,
                   u.UserName, r.UserID
            FROM Ratings r
            JOIN users u ON r.UserID = u.UserId
            WHERE r.ContentID = ?
        `, [contentId]);

        const [avg] = await pool.query(
            'SELECT AVG(RatingScore) AS averageRating FROM Ratings WHERE ContentID = ?',
            [contentId]
        );

        return res.status(200).json({
            averageRating: parseFloat(avg[0].averageRating).toFixed(1) || 0,
            ratings: rows
        });
    } catch (err) {
        console.error('getRatings error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/ratings/:contentId — rate content
const rateContent = async (req, res) => {
    const { contentId } = req.params;
    const { ratingScore, comment } = req.body;

    if (!ratingScore)
        return res.status(400).json({ message: 'ratingScore is required.' });

    if (ratingScore < 1 || ratingScore > 10)
        return res.status(400).json({ message: 'ratingScore must be between 1 and 10.' });

    try {
        // Check content exists
        const [content] = await pool.query(
            'SELECT ContentID FROM content WHERE ContentID = ?', [contentId]
        );
        if (content.length === 0)
            return res.status(404).json({ message: 'Content not found.' });

        await pool.query(
            'INSERT INTO Ratings (UserID, ContentID, RatingScore, Comment) VALUES (?, ?, ?, ?)',
            [req.user.userId, contentId, ratingScore, comment || null]
        );

        return res.status(201).json({ message: 'Rating submitted.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'You have already rated this content.' });
        console.error('rateContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/ratings/:contentId — update your rating
const updateRating = async (req, res) => {
    const { contentId } = req.params;
    const { ratingScore, comment } = req.body;

    if (ratingScore && (ratingScore < 1 || ratingScore > 10))
        return res.status(400).json({ message: 'ratingScore must be between 1 and 10.' });

    try {
        const [result] = await pool.query(`
            UPDATE Ratings 
            SET RatingScore = COALESCE(?, RatingScore),
                Comment = COALESCE(?, Comment)
            WHERE UserID = ? AND ContentID = ?
        `, [ratingScore, comment, req.user.userId, contentId]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Rating not found.' });

        return res.status(200).json({ message: 'Rating updated.' });
    } catch (err) {
        console.error('updateRating error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/ratings/:contentId — delete your rating
const deleteRating = async (req, res) => {
    const { contentId } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM Ratings WHERE UserID = ? AND ContentID = ?',
            [req.user.userId, contentId]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Rating not found.' });

        return res.status(200).json({ message: 'Rating deleted.' });
    } catch (err) {
        console.error('deleteRating error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getRatings, rateContent, updateRating, deleteRating };