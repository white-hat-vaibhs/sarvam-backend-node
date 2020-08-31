const { check } = require("express-validator");
const express = require("express");
const router = express.Router();

const { signup, signin, signout, vendor_sign_up } = require("../controllers/auth");

// Post routes

// Signup route
router.post(
    "/signup",
    [
        // express validator
        check("username")
            .notEmpty().withMessage("Please provide username")
            .isString().withMessage('Invalid username format')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 chars long'),
        check("email")
            .isEmail().withMessage("Please provide correct email"),
        check("contact_no")
            .isInt({ min: 1000000000, max: 9999999999 })
            .withMessage('Contact number invalid, enter a 10 digit contact number'),
        check("password")
            .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
            .withMessage('Password must have minimum eight characters, at least one letter, one number and one special character')
    ],
    signup
);

// ! Signin route
router.post(
    "/signin",
    [
        // express validator
        check("contact_no", "Contact Number required"),
        check("password", "Password required")
    ],
    signin
);



// ! Vendor Signup route
router.post(
    "/vendor_signup",
    [
        // express validator
        check("username")
            .notEmpty().withMessage("Please provide username")
            .isString().withMessage('Invalid username format')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 chars long'),
        check("email")
            .isEmail().withMessage("Please provide correct email"),            
        check("category_opted")
            .notEmpty().withMessage('Vendor Category is required')
            .isMongoId().withMessage('Vendor Category is invalid'),
        check("contact_no")
            .isInt({ min: 1000000000, max: 9999999999 }).withMessage('Contact number invalid, enter a 10 digit contact number'),
        check("bank_account_no").isInt({ min: 0 }).withMessage("Bank account number is required"),
        check("firstname")
            .notEmpty().withMessage('Firstname is required'),
        check("lastname")
            .notEmpty().withMessage('Last name is required'),
        check("shop_name")
            .notEmpty().withMessage('Shop name is required'),
        check("street_address")
            .notEmpty().withMessage('Street address is required'),
        check("city")
            .notEmpty().withMessage('City is required'),
        check("state")
            .notEmpty().withMessage('State required'),
        check("pincode")
            .isInt().withMessage("Invalid Pincode")
            .notEmpty().withMessage("Pincode is required"),
        check("password")
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must have minimum eight characters, at least one letter, one number and one special character')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/).withMessage('Password must have minimum eight characters, at least one letter, one number and one special character')
    ],
    vendor_sign_up
);


// Get routes

router.get("/signout", signout);

module.exports = router;
