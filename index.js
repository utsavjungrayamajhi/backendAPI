const express = require("express");
const app = express();
const mysql = require("mysql2");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const foodRoute = require("./routes/foodItem");
const orderRoute = require("./routes/order");
const paymentRoute = require("./routes/payment");
const epayRoute = require("./routes/epay");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
dotenv.config();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "moviesnacks",
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connection successfull");
  }
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/foods", foodRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/epays", epayRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(5000, () => {
  console.log("Backend server is running");
});
