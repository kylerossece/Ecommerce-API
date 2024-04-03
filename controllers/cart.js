const Products = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");

module.exports.getCart = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }
  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ error: "Cart not found" });
      }
      return res.status(200).send({ cart, totalPrice: cart.totalPrice }); // Include total price in the response
    })
    .catch((err) => {
      console.error("Error finding cart:", err);
      res.status(500).send({ error: "Failed adding cart" });
    });
};

module.exports.addToCart = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  const { productId, quantity, subtotal } = req.body;

  // Check if productId, quantity, and subtotal are provided
  if (!productId || !quantity || !subtotal) {
    return res
      .status(400)
      .send({
        error:
          "Invalid request. Please provide productId, quantity, and subtotal",
      });
  }

  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        const newCart = new Cart({
          userId: req.user.id,
          cartItems: [{ productId, quantity, subtotal }],
          totalPrice: subtotal * quantity, // Adjust total price calculation
        });

        return newCart.save().then((savedCart) => {
          return res
            .status(200)
            .send({
              message: "Item added to cart successfully",
              cart: savedCart,
            });
        });
      } else {
        const existingItem = cart.cartItems.find(
          (item) => item.productId === productId
        );

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.cartItems.push({ productId, quantity, subtotal });
        }

        cart.totalPrice = cart.cartItems.reduce(
          (total, item) => total + item.subtotal * item.quantity,
          0
        );

        return cart.save().then((savedCart) => {
          return res
            .status(201)
            .send({
              message: "Item added to cart successfully",
              cart: savedCart,
            });
        });
      }
    })
    .catch((error) => {
      console.error("Error in adding to cart: ", error);
      return res.status(500).send({ error: "Failed adding product" });
    });
};

module.exports.updateCart = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).json({ error: "Admin is forbidden" });
  }

  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).json({ error: "Cart not found for this user" });
      }

      const { productId, quantity, subtotal } = req.body;
      const cartItem = cart.cartItems.find(
        (item) => item.productId === productId
      );

      if (cartItem) {
        cartItem.quantity = quantity;
      } else {
        cart.cartItems.push({ productId, quantity });
      }

      cart.totalPrice = cart.cartItems.reduce(
        (total, item) => total + item.subtotal * item.quantity,
        0
      );

      return cart.save().then((updatedCart) => {
        return res
          .status(200)
          .send({ message: "Item quantity updated successfully", updatedCart });
      });
    })
    .catch((error) => {
      console.error("Error updating cart quantity: ", error);
      return res.status(500).send({ error: "Failed updating cart quantity" });
    });
};

//removecart

module.exports.removeFromCart = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ error: "Cart not found for this user" });
      }

      const productId = req.params.productId;

      const cartItemIndex = cart.cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (cartItemIndex !== -1) {
        const removedItem = cart.cartItems[cartItemIndex];

        cart.cartItems.splice(cartItemIndex, 1);

        cart.totalPrice = cart.cartItems.reduce(
          (total, item) => total + item.subtotal * item.quantity,
          0
        );

        return cart.save().then(() => {
          const response = {
            message: "Product removed from cart",
            cartItems: [
              {
                productId: removedItem.productId,
                quantity: removedItem.quantity,
                subtotal: removedItem.subtotal,
                _id: removedItem._id,
              },
            ],
            totalPrice: removedItem.subtotal * removedItem.quantity,
          };
          return res.status(200).send(response);
        });
      } else {
        return res.status(404).send({ error: "Product not found in the cart" });
      }
    })
    .catch((error) => {
      console.error("Error removing item from cart: ", error);
      return res
        .status(500)
        .send({
          error: "Failed removing item from cart, please try again later",
        });
    });
};

// clear cart

module.exports.clearCart = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ error: "Admin is forbidden" });
  }

  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ error: "Cart not found for this user" });
      }

      cart.cartItems = [];

      cart.totalPrice = 0;

      return cart.save().then((savedCart) => {
        return res
          .status(200)
          .send({ message: "Cart cleared successfully", cartItems: savedCart });
      });
    })
    .catch((error) => {
      console.error("Error clearing cart: ", error);
      return res
        .status(500)
        .send({ error: "Failed clearing cart, please try again later" });
    });
};
