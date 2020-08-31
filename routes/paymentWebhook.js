const express = require("express");
const router = express.Router();

const {createPaymentEntry} = require("../controllers/paymentWebhook");

router.post("/payment_webhook", createPaymentEntry);

module.exports = router;
