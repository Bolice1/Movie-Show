const express = require('express');
const router  = express.Router();
const {
    getAllContent, getContentById,
    createContent, updateContent, deleteContent
} = require('../controllers/contentController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.get('/',    getAllContent);
router.get('/:id', getContentById);

// Only admins can create, update, delete
router.post('/',      authenticate, isAdmin, createContent);
router.put('/:id',    authenticate, isAdmin, updateContent);
router.delete('/:id', authenticate, isAdmin, deleteContent);

module.exports = router;