const { model } = require('mongoose');
const Destination = require('../models/Destination');

const FiltersController = {
    // Search method with text index
    async Search(req, res) {
        try {
            const searchQuery = req.query.q ? req.query.q.trim() : "";

            if (!searchQuery) {
                return res.status(400).json({
                    type: "error",
                    message: "Query tìm kiếm không được để trống.",
                });
            }

            // Set up pagination and sorting options
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Construct the search query
            const query = { $text: { $search: searchQuery } };

            // Fetch matching documents with pagination and sorting
            const docs = await Destination.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ score: { $meta: "textScore" } }) // Sort by text search relevance
                .exec();

            // Get total matching document count for pagination
            const totalDocs = await Destination.countDocuments(query);

            // Return results with pagination info
            res.status(200).json({
                type: "success",
                page,
                limit,
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit),
                docs,
            });
        } catch (error) {
            console.error("Search error:", error);
            res.status(500).json({
                type: "error",
                message: "Đã xảy ra lỗi trong quá trình tìm kiếm.",
                error: error.message,
            });
        }
    },

    // Filter method
    async Filter(req, res) {
        try {
            const { location, service, rating, minPrice, maxPrice, category, page = 1, limit = 10 } = req.body;

            // Initialize filter object
            const filter = {};

            // Build dynamic filters
            if (location) filter.location = location;
            if (service) filter.service = service;
            if (category) filter.category = category;
            if (rating) filter.rating = { $gte: parseInt(rating), $lt: parseInt(rating) + 1 };
            if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
            if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

            // Pagination settings
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Query the database based on filters
            const docs = await Destination.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .exec();

            // Get the total count of documents for pagination
            const totalDocs = await Destination.countDocuments(filter);

            // Return results with pagination info
            res.status(200).json({
                type: "success",
                page: parseInt(page),
                limit: parseInt(limit),
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit),
                docs,
            });
        } catch (error) {
            console.error("Filter error:", error);
            res.status(500).json({
                type: "error",
                message: "Đã xảy ra lỗi trong quá trình lọc.",
                error: error.message,
            });
        }
    }
};

module.exports = FiltersController;
