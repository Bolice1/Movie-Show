const express = require('express');
const router  = express.Router();
const {
    getAllContent, getContentById,
    createContent, updateContent, deleteContent
} = require('../controllers/contentController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.get('/',    getAllContent);
router.get('/:id', getContentById);

// Protected routes — must be logged in
router.post('/',    authenticate, createContent);
router.put('/:id',  authenticate, updateContent);
router.delete('/:id', authenticate, deleteContent);

module.exports = router;