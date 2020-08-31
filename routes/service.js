const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

// TODO: ADD Conditional routing for vendor and admin

const {
    getService,
    getServiceById,
    getAllServices,
    getAllServicesByVendorId,
    createService,
    updateService,
    removeService
} = require("../controllers/service");

const { isSignedIn, isAuthenticated, isVendor, isServiceVendor } = require("../controllers/auth");

// params
router.param("serviceId", getServiceById);

// actual routes
// ? GET
router.get("/services", getAllServices);
router.get("/services/:serviceId", getService);
// router.get("/services/vendor", isSignedIn, isAuthenticated, isServiceVendor, getAllServicesByVendorId);

// ? POST
router.post(
    "/services",
    [
        check("price").notEmpty().withMessage("Please provide service price")
    ],
    isSignedIn,
    isAuthenticated,
    isVendor,
    createService
);

// ? PUT
router.put(
    "/services/:serviceId",
    isSignedIn,
    isAuthenticated,
    // isVendor,        This testing is done in the controller
    updateService
);

// ? DELETE
router.delete(
    "/services/:serviceId",
    isSignedIn,
    isAuthenticated,
    // isVendor,        This testing is done in the controller
    removeService
);

module.exports = router;