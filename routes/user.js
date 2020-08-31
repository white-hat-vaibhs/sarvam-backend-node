const express = require("express");
const router = express.Router();

const { getUserById, getUser, getAllUsers, updateUser, getAllVendorsByCategoryId, getVendorById } = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

// invoke middleware for user id
router.param("userId", getUserById);

router.get("/users", isSignedIn, isAuthenticated, isAdmin ,getAllUsers);
router.put("/users/:userId", isSignedIn, isAuthenticated, updateUser);

router.get("/vendors/categories/:categoryId", getAllVendorsByCategoryId);
router.get("/vendors/:vendorId", getVendorById);

module.exports = router;
