const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const api_config = require("../configs/api.js");


const OTP = require('../models/Otp');


const AuthController = {

  async sign_up(req, res, next) {
    try {
      const { username, email, phone, password, otp } = req.body;
      // Check if all details are provided
      if (!username || !email || !password || !otp || !phone) {
        return res.status(403).json({
          success: false,
          message: 'All fields are required',
        });
      }
      // Check if user already exists
      const existingUser = await Users.findOne({ email, username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }
      // Find the most recent OTP for the email
      const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
      if (response.length === 0 || otp !== response[0].otp) {
        return res.status(400).json({
          success: false,
          message: 'The OTP is not valid',
        });
      }

      const newUser = new Users({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        user_type: "user",
        password: bcrypt.hashSync(req.body.password, 10)
      });
      const user = await newUser.save();
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: newUser,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

  },


  /* login existing user */
  async login_user(req, res, next) {

    const user = await Users.findOne({ username: req.body.username });

    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      res.status(500).json({
        type: "error",
        message: "User not exists or invalid credentials",
      })
    } else {

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
  },
};

module.exports = AuthController;