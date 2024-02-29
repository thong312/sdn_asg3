const express = require('express');
const orchidRouter = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { isAdmin } = require('../config/auth');

const orchidController = require('../controllers/orchidController');

orchidRouter
    .route('/')
    .get(isAdmin, orchidController.manageOrchid)
    .post(isAdmin, orchidController.createNewOrchid)

orchidRouter
    .route('/delete/:id')
    .get(isAdmin, orchidController.deleteOrchid)

orchidRouter
    .route('/:id')
    .get(orchidController.getOrchidById)

orchidRouter
    .route('/:id/comment')
    .post(ensureAuthenticated, orchidController.addComment);

orchidRouter
    .route('/edit/:id')
    .get(isAdmin, orchidController.getOrchidEditById)
    .post(isAdmin, orchidController.updateOrchidById)

module.exports = orchidRouter;