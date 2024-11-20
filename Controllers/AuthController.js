const otpGenerator = require('otp-generator');
const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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
  },

  async reset_password(req, res, next) {
    try {
      const { email } = req.body;

      // Kiểm tra xem email có tồn tại trong hệ thống không
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({
          type: "error",
          message: "Email not found",
        });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      let newPassword = "";

      while (true) {
        // Tạo mật khẩu ngẫu nhiên
        newPassword = otpGenerator.generate(10, {
          upperCaseAlphabets: true,
          lowerCaseAlphabets: true,
          digits: true,
          specialChars: true,
        });

        // Kiểm tra xem mật khẩu có hợp lệ không
        if (passwordRegex.test(newPassword)) {
          break;
        }
      }
        // Hash mật khẩu trước khi lưu
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Cập nhật mật khẩu trong cơ sở dữ liệu
        user.password = hashedPassword;
        await user.save();

        // Cấu hình và gửi email
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          auth: {
            user: "toanocchocute@gmail.com",
            pass: "hopc uyya qdgx fxkm",
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: "Password Reset Request",
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Password Reset Request</h2>
            <p>Dear <strong>${user.username}</strong>,</p>
            <p>You have requested to reset your password. Here is your new password:</p>
            <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
              <strong style="font-size: 18px; color: #333;">${newPassword}</strong>
            </div>
            <p style="margin: 20px 0; color: #666;">
              Please log in using this new password and make sure to change it as soon as possible for security reasons.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 12px; color: #999;">
              If you did not request this reset, please ignore this email or contact our support team.
            </p>
          </div>
        `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            return res.status(500).json({
              type: "error",
              message: "Failed to send email",
            });
          } else {
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              type: "success",
              message: "New password sent to your email",
            });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          type: "error",
          message: "Something went wrong",
          error: error.message,
        });
      }
    }
}

  module.exports = AuthController;