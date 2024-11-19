const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const api_config = require("../configs/api.js");


const OTP = require('../models/Otp');


const AuthController = {

  async sign_up(req, res, next) {
    try {
      const { username, email, phone, password, otp } = req.body;

      // Kiểm tra xem tất cả các trường đã được cung cấp chưa
      if (!username || !email || !password || !otp || !phone) {
        return res.status(403).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Kiểm tra độ mạnh của mật khẩu
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.",
        });
      }

      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUser = await Users.findOne({ email, username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Tìm OTP gần nhất cho email
      const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
      if (response.length === 0 || otp !== response[0].otp) {
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        });
      }

      // Tạo người dùng mới
      const newUser = new Users({
        username,
        email,
        phone,
        user_type: "user",
        password: bcrypt.hashSync(password, 10), // Hash mật khẩu
      });
      const user = await newUser.save();

      // Trả về phản hồi thành công
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type,
        },
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  },


  async login_user(req, res, next) {
    try {
      const { username, password } = req.body;

      // Kiểm tra xem người dùng có cung cấp username và password không
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Tìm người dùng theo username
      const user = await Users.findOne({ username });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }

      // Kiểm tra mật khẩu với hash đã lưu trong cơ sở dữ liệu
      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid password",
        });
      }

      // Kiểm tra mật khẩu có đáp ứng các yêu cầu không (chữ cái in hoa, số và ký tự đặc biệt)
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must include at least one uppercase letter, one number, and one special character.",
        });
      }

      // Tạo accessToken nếu mật khẩu hợp lệ
      const accessToken = jwt.sign(
        { id: user._id },
        api_config.api.jwt_secret,
        { expiresIn: "3d" }
      );

      // Trả về thông tin người dùng và token
      const { password: userPassword, ...data } = user._doc;

      res.status(200).json({
        success: true,
        message: "Successfully logged in",
        data,
        accessToken,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while logging in",
        error: error.message,
      });
    }
  }
}

  module.exports = AuthController;