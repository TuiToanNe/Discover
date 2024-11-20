const nodemailer = require("nodemailer");
const { getMaxListeners } = require("../models/Booking");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
    //   service: process.env.SERVICE,
      port: 587,
      secure: false,
      auth: {
        user: "toanocchocute@gmail.com",
        pass: "hopc uyya qdgx fxkm",
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent sucessfully");
    return true
  } catch (error) {
    return false
  }
};


module.exports = sendEmail;