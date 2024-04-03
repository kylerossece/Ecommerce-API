const express = require("express");
const orderController = require("../controllers/order");
const router = express.Router();
const { verify, verifyAdmin } = require("../auth");

router.post("/checkout", verify, orderController.checkOut);

router.get("/my-orders", verify, orderController.myOrders);

router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;