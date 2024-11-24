const { model } = require('mongoose');
const Destination = require('../models/Destination');

const FiltersController = {
    // Search method with text index
    async Search(req, res) {
        try {
            // Kiểm tra nếu query tìm kiếm không tồn tại
            if (!req.query.q) {
                return res.status(400).json({
                    type: "error",
                    message: "Query tìm kiếm không được để trống.",
                });
            }

            let searchQuery;
            const queryText = req.query.q.trim();

            if (queryText.includes(" ") || queryText.length > 1) {
                // Tìm kiếm cụm từ chính xác hoặc từ có độ dài lớn hơn 1 ký tự
                searchQuery = { $text: { $search: `"${queryText}"` } };
            } else {
                // Tìm kiếm một ký tự hoặc từ ngắn, sử dụng regex
                searchQuery = { name: { $regex: queryText, $options: "i" } };
            }

            // Tìm các tài liệu phù hợp với điều kiện tìm kiếm
            const docs = await Destination.find(searchQuery);

            // Trả kết quả
            res.status(200).json({
                type: "success",
                docs,
            });
        } catch (error) {
            // Xử lý lỗi
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
            const { address, service, rating, minPrice, maxPrice, category, page = 1, limit = 10 } = req.body;
            // Initialize filter object
            const filter = {};

            // Build dynamic filters
            if (address) filter.address = address;
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
