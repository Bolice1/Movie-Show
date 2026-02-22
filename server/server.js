const express      = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./config/db');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});
// grobal error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));