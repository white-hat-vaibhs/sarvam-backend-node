const express = require("express");
const router = express.Router();
const {check} = require("express-validator");

const {isSignedIn, isAuthenticated} = require("../controllers/auth");
const {isValidOrder, generateOrderPaymentLink} = require("../controllers/order");

router.post("/orders", [
    check("vendor_id").notEmpty().withMessage("Invalid order"),
    check("order_items").notEmpty().withMessage("Invalid order"),
], isSignedIn, isAuthenticated, isValidOrder, generateOrderPaymentLink);

module.exports = router;
