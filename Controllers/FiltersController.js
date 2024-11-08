const { model } = require('mongoose');
const Destination = require('../models/Destination');

const FiltersController = {
    async Search(req, res) {
        try {
            // Kiểm tra nếu query tìm kiếm không tồn tại
            if (!req.query.q) {
                return res.status(400).json({
                    type: "error",
                    message: "Query tìm kiếm không được để trống.",
                });
            }

            // Tạo query tìm kiếm, sử dụng $text search để tìm các tài liệu chứa từ khóa
            const searchQuery = { $text: { $search: `"${req.query.q}"` } };

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

    async Filter(req, res) {
        try {
            // Lấy thông tin lọc từ query string
            const { location, service, rating, minPrice, maxPrice, category } = req.body;

            // Tạo điều kiện lọc động
            let filter = {};

            if (location) {
                filter.location = location;
            }

            if (service) {
                filter.service = service;
            }
            if (rating) {
                filter.rating = { ...filter.rating, $gte: parseInt(rating),  $lte: parseInt(rating)+1};
            }

            if (minPrice) {
                filter.price = { ...filter.price, $gte: parseFloat(minPrice) }; // Giá tối thiểu
            }

            if (maxPrice) {
                filter.price = { ...filter.price, $lte: parseFloat(maxPrice) }; // Giá tối đa
            }

            if (category) {
                filter.category = category;
            }

            // Truy vấn dữ liệu dựa trên điều kiện lọc
            const docs = await Destination.find(filter);

            // Trả kết quả
            res.status(200).json(docs);
        } catch (error) {
            res.status(500).json({ message: 'Đã xảy ra lỗi', error });
        }
    }

}

module.exports = FiltersController

