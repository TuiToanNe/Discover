const express = require('express');
const router = express.Router();

const { AdminController } = require('../Controllers');
const { authenticationVerifier } = require('../Middlewares/VerifyToken');


router.get('/all-users', authenticationVerifier, AdminController.get_all_user);
router.delete('/delete-user/:id', authenticationVerifier, AdminController.delete_a_user);

module.exports = router;