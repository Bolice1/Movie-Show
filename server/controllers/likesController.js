const pool = require('../config/db');

// POST /api/likes/:contentId — like content
const likeContent = async (req, res) => {
    const { contentId } = req.params;

    try {
        // Check content exists
        const [content] = await pool.query(
            'SELECT ContentID FROM content WHERE ContentID = ?', [contentId]
        );
        if (content.length === 0)
            return res.status(404).json({ message: 'Content not found.' });

        await pool.query(
            'INSERT INTO Likes (UserID, ContentID) VALUES (?, ?)',
            [req.user.userId, contentId]
        );

        return res.status(201).json({ message: 'Content liked.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Already liked.' });
        console.error('likeContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/likes/:contentId — unlike content
const unlikeContent = async (req, res) => {
    const { contentId } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM Likes WHERE UserID = ? AND ContentID = ?',
            [req.user.userId, contentId]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Like not found.' });

        return res.status(200).json({ message: 'Content unliked.' });
    } catch (err) {
        console.error('unlikeContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/likes/:contentId — get like count for content
const getLikes = async (req, res) => {
    const { contentId } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS likeCount FROM Likes WHERE ContentID = ?',
            [contentId]
        );
        return res.status(200).json({ likeCount: rows[0].likeCount });
    } catch (err) {
        console.error('getLikes error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { likeContent, unlikeContent, getLikes };