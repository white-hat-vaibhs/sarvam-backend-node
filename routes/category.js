const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const {
    getCategoryById,
    getAllCategories,
    getAllProductCategories,
    getAllServiceCategories,
    createCategory,
    getCategory,
    updateCategory,
    updateSubCategories,
    removeCategory
} = require("../controllers/category");

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

// params
router.param("categoryId", getCategoryById);

// actual routes
// ? GET
router.get("/categories", getAllCategories);
router.get("/categories/products", getAllProductCategories);
router.get("/categories/services", getAllServiceCategories);
router.get("/categories/:categoryId", getCategory);

// ? POST
router.post(
    "/categories",
    [
        check("title").notEmpty().withMessage("Please provide category title"),
        check("thumbnail").notEmpty().withMessage("Please provide category title")
    ],
    isSignedIn,
    isAuthenticated,
    isAdmin,
    createCategory
);

// ? PUT
router.put(
    "/categories/:categoryId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    updateCategory
);

// ? DELETE
router.delete(
    "/categories/:categoryId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    removeCategory
);

module.exports = router;