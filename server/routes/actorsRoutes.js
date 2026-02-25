const express = require('express');
const router  = express.Router();
const { getAllActors, getActorById, createActor, updateActor, deleteActor } = require('../controllers/actorsController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.get('/',    getAllActors);
router.get('/:id', getActorById);

router.post('/',      authenticate, isAdmin, createActor);
router.put('/:id',    authenticate, isAdmin, updateActor);
router.delete('/:id', authenticate, isAdmin, deleteActor);

module.exports = router;