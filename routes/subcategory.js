const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const {
    getAllSubCategories,
    getAllSubCategoriesByParentCategoryId,
    getAllSubCategoriesByVendor,
    createSubCategory,
    getSubCategory,
    getSubCategoryById,
    removeSubCategory,
    updateSubCategory
} = require("../controllers/subcategory");

const { isSignedIn, isAuthenticated, isAdmin, isServiceVendor } = require("../controllers/auth");

// params
router.param("subCategoryId", getSubCategoryById);
router.param("parentCategoryId", getAllSubCategoriesByParentCategoryId);


// actual routes
// ? GET
router.get("/subcategories", getAllSubCategories);
router.get("/subcategories/:subCategoryId", getSubCategory);
router.get("/subcategories/parentcategory/:parentCategoryId", getAllSubCategoriesByParentCategoryId);
router.get("/subcategories/vendor/all", isSignedIn, isAuthenticated, isServiceVendor, getAllSubCategoriesByVendor);


// ? POST
router.post(
    "/subcategories",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    createSubCategory
);

// ? PUT
router.put(
    "/subcategories/:subCategoryId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    updateSubCategory
);

// ? DELETE
router.delete(
    "/subcategories/:subCategoryId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    removeSubCategory
);

module.exports = router;