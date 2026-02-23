const pool = require('../config/db');

// GET /api/genres — get all genres
const getAllGenres = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Genre');
        return res.status(200).json({ genres: rows });
    } catch (err) {
        console.error('getAllGenres error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/genres/:id — get single genre with its content
const getGenreById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Genre WHERE GenreID = ?', [id]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'Genre not found.' });

        // Get all content in this genre
        const [content] = await pool.query(`
            SELECT c.ContentID, c.Title, c.Type, c.Duration
            FROM content c
            JOIN Content_Genre cg ON c.ContentID = cg.ContentID
            WHERE cg.GenreID = ?
        `, [id]);

        return res.status(200).json({ genre: { ...rows[0], content } });
    } catch (err) {
        console.error('getGenreById error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getAllGenres, getGenreById };