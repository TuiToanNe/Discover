const express = require('express');
const router = express.Router();

const { accessLevelVerifier, isAdminVerifier, authenticationVerifier } = require('../Middlewares/VerifyToken');
const { ReviewController } = require('../Controllers');

router.post('/add', authenticationVerifier, ReviewController.create_review);
// router.get('/:id', isAdminVerifier, UserController.get_user);
// router.get('/stats', isAdminVerifier, UserController.get_stats);
// router.put('/:id', accessLevelVerifier, UserController.update_user);
// router.delete('/:id', isAdminVerifier, UserController.delete_user);

module.exports = router;