const Destination = require("../models/Destination");
const Review = require('../models/Review');

const ReviewController = {
    async create_review(req, res) {
        user_id = req.user.id
        destination_id = req.body.destination_id
        rating = req.body.rating

        if (rating < 1 || rating > 5) {
            res.status(422).json({
                type: "not invalid",
                message: "Something went wrong please try again",
            })
            return
        }

        // check destination_id 
        is_update = await Review.updateOne({ user_id: user_id, destination_id: destination_id }, {
            "$set": {
                user_id: user_id,
                destination_id: destination_id,
                rating: rating,
                review: req.body.review
            }
        }, { upsert: true })
        
        results = await Review.find({
            destination_id: destination_id
        })
        count = results.length
        total_rating = 0
        results.forEach(element => {
            total_rating = total_rating + element.rating
        });
        new_avg = total_rating/count
        new_avg = new_avg.toFixed(1)
        await Destination.updateOne({ "_id": destination_id }, { "$set": { "rating": new_avg } })
        

        res.status(200).json({
            type: "success",
            message: "add success",
            data: {
                modifiedCount: is_update.modifiedCount,
                upsertedCount: is_update.upsertedCount
            }
        })
    },
    async update_Review(req, res) {
        try {
            const user_id = req.user.id; // Lấy ID của người dùng từ thông tin đăng nhập
            const { destination_id, rating, review } = req.body;

            // Kiểm tra xem rating có hợp lệ không
            if (rating < 1 || rating > 5) {
                return res.status(422).json({
                    type: "validation_error",
                    message: "Rating must be between 1 and 5",
                });
            }

            // Cập nhật đánh giá
            const is_update = await Review.updateOne(
                { user_id: user_id, destination_id: destination_id },
                {
                    "$set": {
                        rating: rating,
                        review: review,
                    },
                }
            );

            if (is_update.matchedCount === 0) {
                return res.status(404).json({
                    type: "not_found",
                    message: "Review not found",
                });
            }

            // Tính lại trung bình đánh giá
            const reviews = await Review.find({ destination_id: destination_id });
            const count = reviews.length;
            const total_rating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const new_avg = (total_rating / count).toFixed(1);

            // Cập nhật trung bình đánh giá vào Destination
            await Destination.updateOne(
                { "_id": destination_id },
                { "$set": { "rating": new_avg } }
            );

            res.status(200).json({
                type: "success",
                message: "Review updated successfully",
                data: {
                    modifiedCount: is_update.modifiedCount,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                type: "server_error",
                message: "Something went wrong. Please try again later.",
            });
        }
    },
    async delete_rating(req, res) {
        try {
            const user_id = req.user.id; // Lấy ID của người dùng từ thông tin đăng nhập
            const { destination_id } = req.body;

            // Xóa đánh giá của người dùng cho điểm đến cụ thể
            const is_deleted = await Review.deleteOne({ user_id: user_id, destination_id: destination_id });

            // Kiểm tra xem đánh giá có tồn tại để xóa hay không
            if (is_deleted.deletedCount === 0) {
                return res.status(404).json({
                    type: "not_found",
                    message: "Review not found",
                });
            }

            // Lấy lại tất cả các đánh giá còn lại cho điểm đến
            const remaining_reviews = await Review.find({ destination_id: destination_id });
            const count = remaining_reviews.length;

            let new_avg;
            if (count > 0) {
                // Tính lại trung bình đánh giá nếu còn đánh giá
                const total_rating = remaining_reviews.reduce((sum, r) => sum + r.rating, 0);
                new_avg = (total_rating / count).toFixed(1);
            } else {
                // Không còn đánh giá nào, đặt trung bình đánh giá về 0
                new_avg = 0;
            }

            // Cập nhật trung bình đánh giá vào Destination
            await Destination.updateOne(
                { "_id": destination_id },
                { "$set": { "rating": new_avg } }
            );

            res.status(200).json({
                type: "success",
                message: "Review deleted successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                type: "server_error",
                message: "Something went wrong. Please try again later.",
            });
        }
    },

}


module.exports = ReviewController