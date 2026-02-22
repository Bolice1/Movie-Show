const pool = require('../config/db');

// GET /api/content — get all movies & series
const getAllContent = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.ContentID, c.Title, c.Description, 
                c.ReleaseDate, c.Duration, c.Type,
                GROUP_CONCAT(DISTINCT g.GenreName) AS genres,
                GROUP_CONCAT(DISTINCT a.Name)      AS actors
            FROM content c
            LEFT JOIN Content_Genre cg ON c.ContentID = cg.ContentID
            LEFT JOIN Genre g          ON cg.GenreID  = g.GenreID
            LEFT JOIN Content_Actors ca ON c.ContentID = ca.ContentID
            LEFT JOIN Actors a          ON ca.ActorID  = a.ActorID
            GROUP BY c.ContentID
        `);
        return res.status(200).json({ content: rows });
    } catch (err) {
        console.error('getAllContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/content/:id — get single content with full details
const getContentById = async (req, res) => {
    const { id } = req.params;
    try {
        // Get content details
        const [rows] = await pool.query(
            'SELECT * FROM content WHERE ContentID = ?', [id]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'Content not found.' });

        const content = rows[0];

        // Get its genres
        const [genres] = await pool.query(`
            SELECT g.GenreID, g.GenreName FROM Genre g
            JOIN Content_Genre cg ON g.GenreID = cg.GenreID
            WHERE cg.ContentID = ?
        `, [id]);

        // Get its actors
        const [actors] = await pool.query(`
            SELECT a.ActorID, a.Name, a.BirthDate, ca.Role FROM Actors a
            JOIN Content_Actors ca ON a.ActorID = ca.ActorID
            WHERE ca.ContentID = ?
        `, [id]);

        // If it's a serie, get seasons and episodes
        let seasons = [];
        if (content.Type === 'Serie') {
            const [seasonRows] = await pool.query(
                'SELECT * FROM Seasons WHERE ContentID = ?', [id]
            );
            for (let season of seasonRows) {
                const [episodes] = await pool.query(
                    'SELECT * FROM Episodes WHERE SeasonID = ?', [season.SeasonID]
                );
                seasons.push({ ...season, episodes });
            }
        }

        return res.status(200).json({ content: { ...content, genres, actors, seasons } });
    } catch (err) {
        console.error('getContentById error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/content — add new content (protected)
const createContent = async (req, res) => {
    const { title, description, duration, type, genreIds, actorIds } = req.body;

    if (!title || !duration || !type)
        return res.status(400).json({ message: 'Title, duration and type are required.' });

    if (!['Movie', 'Serie'].includes(type))
        return res.status(400).json({ message: 'Type must be Movie or Serie.' });

    try {
        // Insert content
        const [result] = await pool.query(
            'INSERT INTO content (Title, Description, Duration, Type) VALUES (?, ?, ?, ?)',
            [title, description, duration, type]
        );
        const contentId = result.insertId;

        // Link genres if provided
        if (genreIds && genreIds.length > 0) {
            const genreValues = genreIds.map(gId => [contentId, gId]);
            await pool.query('INSERT INTO Content_Genre (ContentID, GenreID) VALUES ?', [genreValues]);
        }

        // Link actors if provided
        if (actorIds && actorIds.length > 0) {
            const actorValues = actorIds.map(({ id, role }) => [contentId, id, role || null]);
            await pool.query('INSERT INTO Content_Actors (ContentID, ActorID, Role) VALUES ?', [actorValues]);
        }

        return res.status(201).json({ message: 'Content created successfully.', contentId });
    } catch (err) {
        console.error('createContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/content/:id — update content (protected)
const updateContent = async (req, res) => {
    const { id } = req.params;
    const { title, description, duration, type } = req.body;

    try {
        const [existing] = await pool.query(
            'SELECT ContentID FROM content WHERE ContentID = ?', [id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: 'Content not found.' });

        await pool.query(`
            UPDATE content 
            SET Title = COALESCE(?, Title),
                Description = COALESCE(?, Description),
                Duration = COALESCE(?, Duration),
                Type = COALESCE(?, Type)
            WHERE ContentID = ?
        `, [title, description, duration, type, id]);

        return res.status(200).json({ message: 'Content updated successfully.' });
    } catch (err) {
        console.error('updateContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/content/:id — delete content (protected)
const deleteContent = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT ContentID FROM content WHERE ContentID = ?', [id]
        );
        if (existing.length === 0)
            return res.status(404).json({ message: 'Content not found.' });

        await pool.query('DELETE FROM content WHERE ContentID = ?', [id]);

        return res.status(200).json({ message: 'Content deleted successfully.' });
    } catch (err) {
        console.error('deleteContent error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getAllContent, getContentById, createContent, updateContent, deleteContent };