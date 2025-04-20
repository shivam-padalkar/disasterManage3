const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "critical", "resolved"],
    required: true,
  },
  disasterType: { type: String, required: true }, // <== this is required
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: { type: String, required: false },
});

module.exports = mongoose.model("Report", reportSchema);

// app.post("/reports", upload.single("image"), async (req, res) => {
//   const { name, disasterType, lat, lng, status, message } = req.body;

//   const newReport = new Report({
//     name,
//     disasterType,
//     location: {
//       lat: parseFloat(lat),
//       lng: parseFloat(lng),
//     },
//     status,
//     message,
//     image: req.file ? `/uploads/${req.file.filename}` : null,
//   });

//   await newReport.save();
//   res.redirect("/reports");
// });
