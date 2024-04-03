const Products = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");

module.exports.addProducts = (req, res) => {
  let newProducts = new Products({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  });

  Products.findOne({ name: req.body.name })
    .then((existingProducts) => {
      if (existingProducts) {
        return res.status(409).json({ error: "Products already exists" });
      }

      newProducts
        .save()
        .then((savedProducts) => {
          return res.status(201).json({ savedProducts });
        })
        .catch((saveErr) => {
          console.error("Error in saving the products: ", saveErr);
          return res.status(500).json({ error: "Failed to save the products" });
        });
    })
    .catch((findErr) => {
      console.error("Error in finding the products: ", findErr);
      return res.status(500).json({ error: "Error finding the products" });
    });
};

module.exports.getAllProducts = (req, res) => {
  return Products.find({})

    .then((Products) => {
      if (Products.length > 0) {
        return res.status(200).send({ Products });
      } else {
        return res.status(200).send({ message: "No Products found." });
      }
    })

    .catch((err) => {
      console.error("Error in finding all Products:", err);
      return res.status(500).send({ error: "Error finding Products." });
    });
};

module.exports.getAllActive = (req, res) => {
  Products.find({ isActive: true })
    .then((Products) => {
      if (Products.length > 0) {
        return res.status(200).send({ Products });
      } else {
        return res.status(200).send({ message: "No active products found." });
      }
    })
    .catch((err) => {
      console.error("Eror in finding active products: ", err);
      return res.status(500).send({ error: "Error finding active products" });
    });
};

module.exports.getProducts = (req, res) => {
  const productId = req.params.productId;

  Products.findById(productId)
    .then((products) => {
      if (!products) {
        return res.status(404).send({ error: "Products not found" });
      }
      return res.status(200).send({ products });
    })
    .catch((err) => {
      console.error("Error in fetching the Products: ", err);
      return res.status(500).send({ error: "Failed to fetch products" });
    });
};

module.exports.updateProducts = (req, res) => {
  const productId = req.params.productId;

  let updatedProducts = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };

  //findByIdAndUpdate() finds the doc in the db and updates it automatically

  return Products.findByIdAndUpdate(productId, updatedProducts)
    .then((updatedProducts) => {
      if (!updatedProducts) {
        return res.status(404).send({ error: "Product not found" });
      }

      return res.status(200).send({
        message: "Product updated successfully",
        updatedProducts: updatedProducts,
      });
    })
    .catch((err) => {
      console.error("Error in updating a product: ", err);
      return res.status(500).send({ error: "Error in updating a product." });
    });
};

module.exports.archiveProducts = (req, res) => {
  let updateActiveField = {
    isActive: false,
  };

  return Products.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then((archiveProducts) => {
      if (!archiveProducts) {
        return res.status(404).send({ error: "Product not found" });
      }
      return res.status(200).send({
        message: "Product archived successfully",
        archiveProducts: archiveProducts,
      });
    })
    .catch((err) => {
      console.error("Error in archiving a product: ", err);
      return res.status(500).send({ error: "Failed to archive product" });
    });
};

module.exports.activateProducts = (req, res) => {
  let updateActiveField = {
    isActive: true,
  };

  return Products.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then((activateProducts) => {
      if (!activateProducts) {
        return res.status(404).send({ error: "Products not found" });
      }
      return res.status(200).send({
        message: "Products activated successfully",
        activateProducts: activateProducts,
      });
    })
    .catch((err) => {
      console.error("Error in activating a products: ", err);
      return res.status(500).send({ error: "Failed to activating a products" });
    });
};

// Search products by name

module.exports.searchProductByName = (req, res) => {
  const productName = req.body.name;

  // Perform a case-insensitive search for products containing the provided name
  Products.find({ name: { $regex: productName, $options: "i" } })
    .then((products) => {
      if (!products || products.length === 0) {
        return res
          .status(404)
          .json({ error: "No products found matching the provided name" });
      }
      return res.status(200).json({ products });
    })
    .catch((error) => {
      console.error("Error searching for product by name: ", error);
      return res
        .status(500)
        .json({ error: "Failed to search for product by name" });
    });
};

module.exports.searchProductByPriceRange = (req, res) => {
  const { minPrice, maxPrice } = req.body;

  // Validate input
  if (!minPrice || !maxPrice || isNaN(minPrice) || isNaN(maxPrice)) {
    return res.status(400).json({ error: "Invalid price range provided" });
  }

  // Convert prices to numbers
  const minPriceValue = parseFloat(minPrice);
  const maxPriceValue = parseFloat(maxPrice);

  // Find products within the specified price range
  Products.find({ price: { $gte: minPriceValue, $lte: maxPriceValue } })
    .then((products) => {
      if (!products || products.length === 0) {
        return res.status(404).json({
          error: "No products found within the specified price range",
        });
      }
      return res.status(200).json({ products });
    })
    .catch((error) => {
      console.error("Error searching for products by price range: ", error);
      return res
        .status(500)
        .json({ error: "Failed to search for products by price range" });
    });
};
