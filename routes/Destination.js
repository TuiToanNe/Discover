const express = require("express");
const router = express.Router();

const destinationController = require("../Controllers/DestinationController");

router.get("/list", destinationController.listDestination);
router.get("/categories", destinationController.getCategories);
router.get("/addresses", destinationController.getAddresses);

module.exports = router;
