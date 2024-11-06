const express = require('express');
const router = express.Router();

const { AuthController } = require('../Controllers');

router.post('/register/', AuthController.create_user);
router.post('/login', AuthController.login_user);
router.get("/verify", AuthController.verify_user)

module.exports = router;