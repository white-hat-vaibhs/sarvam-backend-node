const express = require("express");
const router = express.Router();
const {check} = require("express-validator");

const {createPaymentRequest} = require("../controllers/paymentRequest");

router.post("/payment_request", createPaymentRequest);

module.exports = router;
