// const express = require("express");
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");

// const Report = require("./models/report.js"); // Adjust model if needed

// const app = express();

// // MongoDB Connection URL
// const MONGO_URL = "mongodb://127.0.0.1:27017/disasterDB";

// // Connect to MongoDB
// main()
//   .then(() => {
//     console.log("Connected to the Database");
//   })
//   .catch((err) => {
//     console.log("MongoDB Connection Error:", err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// // View Engine Setup
// app.engine("ejs", ejsMate); // Support for layouts
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));
// app.use(methodOverride("_method"));

// // Root Route
// app.get("/", (req, res) => {
//   res.send("Welcome to the Disaster Management App Backend!");
// });

// // Sample Route to Test Mongo Connection
// app.get("/test", async (req, res) => {
//   const sample = new Report({
//     name: "Test Person",
//     message: "This is a test entry.",
//     location: { lat: 19.076, lng: 72.8777 },
//     status: "pending",
//   });
//   await sample.save();
//   res.send("Sample report saved to database!");
// });

// // Listening Port
// app.listen(8080, () => {
//   console.log("Server is running on port 8080");
// });

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const multer = require("multer");
// const path = require("path");

const Report = require("./models/report.js");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/disasterDB";

const fs = require("fs");

const uploadPath = "public/uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// MongoDB Connection
main()
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log("DB Connection Error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// 🌐 Root
app.get("/", (req, res) => {
  res.redirect("/home");
});

// ------------------------------
// REPORTS ROUTES
// ------------------------------

// Index - Show all reports
app.get("/reports", async (req, res) => {
  const allReports = await Report.find({});
  res.render("reports/index.ejs", { allReports });
});

// New - Form to add a new report
app.get("/reports/new", (req, res) => {
  res.render("reports/new.ejs");
});

// Create - Save new report
// app.post("/reports", async (req, res) => {
//   const newReport = new Report(req.body.report);
//   await newReport.save();
//   res.redirect("/reports");
// });

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

// app.post("/reports", upload.single("image"), async (req, res) => {
//   try {
//     const { name, disasterType, lat, lng, status, message } = req.body;

//     const newReport = new Report({
//       name,
//       disasterType,
//       location: {
//         lat: parseFloat(lat),
//         lng: parseFloat(lng),
//       },
//       status,
//       message,
//       image: req.file ? `/uploads/${req.file.filename}` : null,
//     });

//     await newReport.save();
//     res.redirect("/reports");
//   } catch (error) {
//     console.error("Error creating report:", error.message);
//     res.status(400).send("Something went wrong. Please check your form.");
//   }
// });

app.post("/reports", upload.single("image"), async (req, res) => {
  try {
    const { name, disasterType, status, message } = req.body.report;
    const { lat, lng } = req.body.report.location;

    const newReport = new Report({
      name,
      disasterType,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      status,
      message,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newReport.save();
    res.redirect("/reports");
  } catch (error) {
    console.error("Error creating report:", error.message);
    res.status(400).send("Something went wrong. Please check your form.");
  }
});

// Show - Show specific report by ID
app.get("/reports/:id", async (req, res) => {
  const { id } = req.params;
  const report = await Report.findById(id);
  res.render("reports/show.ejs", { report });
});

// Edit - Show edit form
app.get("/reports/:id/edit", async (req, res) => {
  const { id } = req.params;
  const report = await Report.findById(id);
  res.render("reports/edit.ejs", { report });
});

// Update - Submit edited form
app.put("/reports/:id", async (req, res) => {
  const { id } = req.params;
  await Report.findByIdAndUpdate(id, { ...req.body.report });
  res.redirect(`/reports/${id}`);
});

// Delete - Remove report
app.delete("/reports/:id", async (req, res) => {
  const { id } = req.params;
  await Report.findByIdAndDelete(id);
  res.redirect("/reports");
});

app.get("/home", (req, res) => {
  res.render("pages/home");
});

app.get("/media", (req, res) => {
  res.render("pages/media");
});

app.get("/donate", (req, res) => {
  res.render("pages/donate");
});

app.get("/livemap", (req, res) => {
  res.render("pages/livemap");
});

app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find({});
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports." });
  }
});


const axios = require("axios");

// Replace with your real API key or use OpenStreetMap (no key needed)
const GEOCODE_API_URL = "https://nominatim.openstreetmap.org/search";

app.get("/geocode", async (req, res) => {
  const location = req.query.q;
  try {
    const response = await axios.get(GEOCODE_API_URL, {
      params: {
        q: location,
        format: "json",
        limit: 1,
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      res.json({
        lat: result.lat,
        lng: result.lon,
      });
    } else {
      res.status(404).json({ message: "Location not found" });
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    res.status(500).json({ message: "Geocoding failed" });
  }
});


// Start Server
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});