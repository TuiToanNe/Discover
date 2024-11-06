const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
    },

    password: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true,
        unique: true,
    },
    phone: {
        type: String,
        require: true,
        unique: true,
    },
    user_type: {
        type: String,
        require: true,
    },
    verify:{
        type:Boolean,
        require:true,
    }
})
module.exports = mongoose.model('Users', UsersSchema);