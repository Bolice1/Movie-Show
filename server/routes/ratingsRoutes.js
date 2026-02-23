const express = require('express');
const router  = express.Router();
const { getRatings, rateContent, updateRating, deleteRating } = require('../controllers/ratingsController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/:contentId',    getRatings);                       // public
router.post('/:contentId',   authenticate, rateContent);        // protected
router.put('/:contentId',    authenticate, updateRating);       // protected
router.delete('/:contentId', authenticate, deleteRating);       // protected

module.exports = router;