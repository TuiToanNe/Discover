const express = require('express');
const router = express.Router();

const { accessLevelVerifier, isAdminVerifier, authenticationVerifier } = require('../Middlewares/VerifyToken');
const { ReviewController } = require('../Controllers');

router.post('/add', authenticationVerifier, ReviewController.create_review);
router.put('/update',authenticationVerifier,ReviewController.update_Review);
router.delete('/delete',authenticationVerifier,ReviewController.delete_rating);

module.exports = router;