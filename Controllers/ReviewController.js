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
        res.status(200).json({
            type: "success",
            message: "add success",
            data : {
                modifiedCount : is_update.modifiedCount,
                upsertedCount : is_update.upsertedCount
            }
        })
    }
}


module.exports = ReviewController