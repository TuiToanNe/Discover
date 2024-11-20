const UserRequire = require("../models/userRequireModel");
const Destination = require("../models/Destination");
const mongoose = require("mongoose");

const PlanController = {
  async createPlan(req, res) {
    try {
      const userRequireId = req.params.id;

      // Validate if userRequireId exists
      if (!userRequireId) {
        return res.status(400).json({
          type: "error",
          message: "UserRequire ID is required",
        });
      }

      // Check if userRequireId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userRequireId)) {
        return res.status(400).json({
          type: "error",
          message: "Invalid UserRequire ID format",
        });
      }

      const userRequire = await UserRequire.findById(userRequireId).populate(
        "userId"
      );

      if (!userRequire) {
        return res.status(404).json({
          type: "error", 
          message: "UserRequire not found"
        });
      }

      const { totalDay, budget, category, address } = userRequire;
      const categories = category;

      let selectedTrips = [];
      let totalCost = 0;
      let attempts = 0;
      const maxAttempts = 100;

      for (let day = 0; day < totalDay; day++) {
        for (let timeSlot = 0; timeSlot < categories.length; timeSlot++) {
          const category = categories[timeSlot];
          const destinations = await Destination.find({ 
            category,
            address: { $regex: address, $options: "i" },
          });

          if (destinations.length === 0) {
            return res.status(404).json({
              message: `No destinations found for the category: ${category}`,
            });
          }

          let foundTrip = false;

          while (attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * destinations.length);
            const selectedDestination = destinations[randomIndex];

            if (totalCost + selectedDestination.price <= budget + 1000) {
              selectedTrips.push(selectedDestination);
              totalCost += selectedDestination.price;
              foundTrip = true;
              break;
            }

            attempts++;
          }

          if (!foundTrip) {
            return res.status(400).json({
              message: "Not enough budget for any trips",
              currentTotalCost: totalCost,
              budget: budget,
              maxAffordablePrice: budget + 1000 - totalCost,
            });
          }
        }
      }

      res.status(200).json({
        type: "success",
        totalCost,
        selectedTrips,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "An error occurred while creating the plan.",
        error: error.message,
      });
    }
  },
};

module.exports = PlanController;
