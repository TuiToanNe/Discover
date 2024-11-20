const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const api_config = require("../configs/api.js");

const sendEmail = require("../utils/mail.js")

gen_veritymail_token = (username) => {
    const verifyToken = jwt.sign({
        username: username,
        type: "verify"
    },
        api_config.api.jwt_secret,
    );
    return verifyToken;
}


const AuthController = {

    /* create new user */
    async create_user(req, res, next) {
        const newUser = new Users({
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            user_type: "user",
            password: bcrypt.hashSync(req.body.password, 10)
        });

        try {
            const user = await newUser.save();
            let is_sendmail = sendEmail(req.body.email, "verify account", `link : http://localhost:1000/api/v1/auth/verify?token=${gen_veritymail_token(req.body.username)}`)
            if (!is_sendmail) {
                res.status(500).json({
                    type: 'error',
                    message: "Khong the goi mail",
                })
                return
            }
            
            res.status(201).json({
                type: 'success',
                message: "kiem tra mail de verify",
            })
        } catch (err) {
            res.status(500).json({
                type: "error",
                message: "Something went wrong please try again",
                err
            })
        }
    },

    async verify_user(req, res) {
        token = req.query.token
        jwt.verify(token, api_config.api.jwt_secret, (err, user) => {   
            if (err) {
                res.status(401).json("Invalid token");
                return
            }
            req.user = user
        })
        if (! req.user) return

        username = req.user.username
        
        let is_verify = await Users.updateOne({
            username: username
        }, {
            "$set": {
                verify: true
            }
        }, {
            upsert: true
        })
        if (is_verify.modifiedCount > 0) {
            res.status(200).json({
                "message" : "Xac thuc thanh cong vui long login"
            })
        }else{
            res.status(500).json({
                "message" : "khong ther verify, vui long thu lai"
            })
        }
    },

    /* login existing user */
    async login_user(req, res) {

        const user = await Users.findOne({ username: req.body.username });

        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            res.status(500).json({
                type: "error",
                message: "User not exists or invalid credentials",
            })
        } else {
            if (!user.verify){
                res.status(401).json({
                    message:"tai khoan chua xac thuc"
                })
                return
            }

            const accessToken = jwt.sign({
                id: user._id,
            },
                api_config.api.jwt_secret,
                { expiresIn: "3d" }
            );

            const { password, ...data } = user._doc;

            res.status(200).json({
                type: "success",
                message: "Successfully logged",
                ...data,
                accessToken
            })
        }
    }
};

module.exports = AuthController;