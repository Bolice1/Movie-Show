const express        = require('express');
const cookieParser   = require('cookie-parser');
require('dotenv').config();
require('./config/db');

const authRoutes     = require('./routes/authRoutes');
const contentRoutes  = require('./routes/contentRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const likesRoutes    = require('./routes/likesRoutes');
const ratingsRoutes  = require('./routes/ratingsRoutes');
const actorsRoutes   = require('./routes/actorsRoutes');
const genresRoutes   = require('./routes/genresRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));


app.use('/api/auth',      authRoutes);
app.use('/api/content',   contentRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/likes',     likesRoutes);
app.use('/api/ratings',   ratingsRoutes);
app.use('/api/actors',    actorsRoutes);
app.use('/api/genres',    genresRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
