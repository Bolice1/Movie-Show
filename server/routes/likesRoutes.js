const express = require('express');
const router = express.Router();
const { likeContent, unlikeContent, getLikes } = require('../controllers/likesController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/:contentId', getLikes);
router.post('/:contentId', authenticate, likeContent);     // protected
router.delete('/:contentId', authenticate, unlikeContent);   // protected

module.exports = router;