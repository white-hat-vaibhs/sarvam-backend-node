const { check } = require("express-validator");
const express = require("express");
const router = express.Router();

const { verifyOtp, generateOtp } = require("../controllers/otp");

router.post(
    "/verify_otp",
    [
        check("contact_no", "Please provide correct contact number")
            .isInt({ min: 999999999, max: 9999999999 })
            .withMessage('Contact number invalid, enter a 10 digit contact number'),
        check("otp", "Please provide correct OTP")
            .isInt({ min: 100000, max: 999999 })
            .withMessage('Invalid OTP'),
    ],
    verifyOtp
);

router.post(
    "/request_otp",
    [
        check("contact_no", "Please provide correct contact number").isInt({ gt: 999999999 })
    ],
    generateOtp
);

module.exports = router;
