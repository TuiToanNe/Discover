const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    destination_id:{
        type : String,
        require :true,
    },
    user_id:{
        type : String,
        require:true,
    },
    rating:{
        type : Number,
        require:true,
    },
    review:{
        type : String,
        require:true,
    },
})
module.exports = mongoose.model('Review', ReviewSchema);