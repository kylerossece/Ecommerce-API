const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/user.js");
const productsRoutes = require("./routes/products.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");

const port = 4004;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(
  "mongodb+srv://admin:admin1234@wdc028-course-booking.qrwky5m.mongodb.net/Ecommerce-API?retryWrites=true&w=majority&appName=WDC028-Course-Booking"
);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("We're connected to our MongoDB!"));

app.use("/b4/users", userRoutes);
app.use("/b4/products", productsRoutes);
app.use("/b4/cart", cartRoutes);
app.use("/b4/orders", orderRoutes);

if (require.main === module) {
  app.listen(process.env.port || port, () => {
    console.log(`API is now online on Port ${process.env.PORT || port}`);
  });
}

module.exports = { app, mongoose };
