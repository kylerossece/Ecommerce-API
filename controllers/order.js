const Order = require("../models/Order");
const Cart = require("../models/Cart");

module.exports.checkOut = (req, res) => {
  try {
    if (req.user.isAdmin) {
      return res.status(403).send({ error: "Admin is forbidden" });
    }

    Cart.findOne({ userId: req.user.id })
      .then((cart) => {
        if (!cart || cart.cartItems.length === 0) {
          return res.status(404).res({ error: "Cart is empty for this user" });
        } else if (cart.cartItems.length >= 1) {
          const newOrder = new Order({
            userId: req.user.id,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice,
          });

          return newOrder.save().then((savedOrder) => {
            return res.status(201).send({
              message: "Ordered successfully",
              order: savedOrder,
            });
          });
        }
      })
      .catch((error) => {
        console.error("Error in checkout: ", error);
        return res.status(500).send({ error: "Failed checkout" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports.myOrders = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  Order.find({ userId: req.user.id })
    .then((orders) => {
      if (!orders) {
        return res.status(404).send({ error: "Order not found" });
      }
      return res.status(200).send({ orders });
    })
    .catch((err) => {
      console.error("Error finding order:", err);
      res.status(500).send({ error: "Failed finding order" });
    });
};

module.exports.getAllOrders = (req, res) => {
  return Order.find({})
    .then((orders) => {
      if (orders.length > 0) {
        return res.status(200).send({ orders });
      } else {
        return res.status(404).send({ message: "No orders found" });
      }
    })
    .catch((err) => {
      console.error("Error in getting all orders", err);
      return res.status(500).send({ error: "Failed getting all orders" });
    });
};


