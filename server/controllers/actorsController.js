const pool = require('../config/db');

// GET /api/actors — get all actors
const getAllActors = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Actors');
        return res.status(200).json({ actors: rows });
    } catch (err) {
        console.error('getAllActors error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/actors/:id — get single actor with their content
const getActorById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Actors WHERE ActorID = ?', [id]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'Actor not found.' });

        // Get all content this actor appeared in
        const [content] = await pool.query(`
            SELECT c.ContentID, c.Title, c.Type, ca.Role
            FROM content c
            JOIN Content_Actors ca ON c.ContentID = ca.ContentID
            WHERE ca.ActorID = ?
        `, [id]);

        return res.status(200).json({ actor: { ...rows[0], content } });
    } catch (err) {
        console.error('getActorById error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/actors — add new actor (protected)
const createActor = async (req, res) => {
    const { name, birthDate, bio } = req.body;

    if (!name)
        return res.status(400).json({ message: 'Name is required.' });

    try {
        const [result] = await pool.query(
            'INSERT INTO Actors (Name, BirthDate, Bio) VALUES (?, ?, ?)',
            [name, birthDate || null, bio || null]
        );
        return res.status(201).json({ message: 'Actor created.', actorId: result.insertId });
    } catch (err) {
        console.error('createActor error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/actors/:id — update actor (protected)
const updateActor = async (req, res) => {
    const { id } = req.params;
    const { name, birthDate, bio } = req.body;

    try {
        const [result] = await pool.query(`
            UPDATE Actors
            SET Name = COALESCE(?, Name),
                BirthDate = COALESCE(?, BirthDate),
                Bio = COALESCE(?, Bio)
            WHERE ActorID = ?
        `, [name, birthDate, bio, id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Actor not found.' });

        return res.status(200).json({ message: 'Actor updated.' });
    } catch (err) {
        console.error('updateActor error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/actors/:id — delete actor (protected)
const deleteActor = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM Actors WHERE ActorID = ?', [id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Actor not found.' });

        return res.status(200).json({ message: 'Actor deleted.' });
    } catch (err) {
        console.error('deleteActor error:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getAllActors, getActorById, createActor, updateActor, deleteActor };