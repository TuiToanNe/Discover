const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    destination_id:{
        type : String,
        require :true,
        unique:true,
    },
    user_id:{
        type : String,
        require:true,
        unique:true,
    },
    rating:{
        type : Number,
        require:true,
        unique:true,
    },
    review:{
        type : String,
        require:true,
    },
})
module.exports = mongoose.model('Review', ReviewSchema);