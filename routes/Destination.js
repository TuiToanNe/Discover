const express = require('express');
const router = express.Router();

const destinationController = require('../Controllers/DestinationController');

router.get('/list', destinationController.listDestination);

module.exports = router;