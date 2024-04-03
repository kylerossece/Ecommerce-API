const express = require("express");
const productsController = require("../controllers/products");
const {verify, verifyAdmin} = require("../auth");

//[Routing Component] 
const router = express.Router();



// Add products
router.post("/", verify, verifyAdmin, productsController.addProducts);

// All products
router.get("/all", verify, verifyAdmin, productsController.getAllProducts);

// All active products
router.get("/", productsController.getAllActive);

// Single Product
router.get("/:productId", productsController.getProducts);

router.patch("/:productId/update",verify,verifyAdmin, productsController.updateProducts);

router.patch("/:productId/archive", verify, verifyAdmin, productsController.archiveProducts);

router.patch("/:productId/activate",verify,verifyAdmin, productsController.activateProducts);

router.post('/searchByName', productsController.searchProductByName);

router.post('/searchByPrice', productsController.searchProductByPriceRange);

module.exports = router;
