const express = require('express');
const router  = express.Router();
const { getAllGenres, getGenreById } = require('../controllers/genresController');

router.get('/',    getAllGenres);
router.get('/:id', getGenreById);

module.exports = router;