const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();

// TODO: ADD Conditional routing for vendor and admin

const {
    getProduct,
    getProductById,
    getAllProducts,
    createProduct,
    updateProduct,
    removeProduct
} = require("../controllers/product");

const { isSignedIn, isAuthenticated, isProductVendor } = require("../controllers/auth");

// params
router.param("productId", getProductById);

// actual routes
// ? GET
router.get("/products", getAllProducts);
router.get("/products/:productId", getProduct);

// ? POST
router.post(
    "/products",
    isSignedIn,
    isAuthenticated,
    isProductVendor,
    createProduct
);

// ? PUT
router.put(
    "/products/:productId",
    isSignedIn,
    isAuthenticated,
    // isVendor,        This testing is done in the controller
    updateProduct
);

// ? DELETE
router.delete(
    "/products/:productId",
    isSignedIn,
    isAuthenticated,
    // isVendor,        This testing is done in the controller
    removeProduct
);

module.exports = router;