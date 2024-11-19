const express = require('express');
const router = express.Router();

const { AuthController } = require('../Controllers');

router.post('/login', AuthController.login_user);
router.post('/signup', AuthController.sign_up);
module.exports = router;