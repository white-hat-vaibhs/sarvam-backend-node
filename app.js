require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
var morgan = require('morgan')

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const subCategoryRoutes = require("./routes/subcategory");
const otpRoutes = require("./routes/otp");
const productRoutes = require("./routes/product")
const serviceRoutes = require("./routes/service")
const orderRoutes = require("./routes/order")
const webhookRoutes = require("./routes/paymentWebhook")
const paymentRequestRoutes = require("./routes/paymentRequest")
// DB Connection
mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName: "sarvam"
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

// Middlewares
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", subCategoryRoutes);
app.use("/api", otpRoutes);
app.use("/api", productRoutes);
app.use("/api", serviceRoutes);
app.use("/api", orderRoutes);
app.use("/api", webhookRoutes);
app.use("/api", paymentRequestRoutes);
// PORT
const port = process.env.PORT || 5000;
// Starting server
app.listen(port, () => {
  console.log(`Server up and running on http://localhost:${port}`);
});
