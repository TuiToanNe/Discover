const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import hàm tạo UUID

const DestinationSchema = new mongoose.Schema(
  {
    // destination_id: {
    //   type: String, // Đổi thành String để sử dụng UUID
    //   default: uuidv4, // Tạo UUID tự động khi thêm document mới
    //   unique: true,
    //   index: true,
    // },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    open_hours: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    distance: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// // Tạo model từ schema
// DestinationSchema.pre("save", async function (next) {
//   const destination = this;
//   console.log("Before save", destination.name);
//   const checkDestination = await mongoose.model("Destination").findOne({
//     name: { $regex: "^" + destination.name + "$", $options: "i" },
//   });
//   console.log(checkDestination);
//   if (checkDestination) {
//     console.log("Destination already exists");
//     return next(new Error("Destination already exists"));
//   }
//   next();
// });

module.exports = mongoose.model("Destination", DestinationSchema);