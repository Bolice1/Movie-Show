const express = require('express');
const router  = express.Router();
const { getAllActors, getActorById, createActor, updateActor, deleteActor } = require('../controllers/actorsController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/',     getAllActors);
router.get('/:id',  getActorById);
router.post('/',    authenticate, createActor);
router.put('/:id',  authenticate, updateActor);
router.delete('/:id', authenticate, deleteActor);

module.exports = router;