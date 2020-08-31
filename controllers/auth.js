const { validationResult } = require("express-validator");
const User = require("../models/user");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const fetch = require("node-fetch")
const { generateRandomOtp } = require("../utils/otp")
const formidable = require("formidable");
const { uploadShopThumbnail } = require("../utils/gcp")
const _ = require("lodash")

// Signup controller
exports.signup = (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg,
            param: errors.array()[0].param
        });
    }
    req.body["role"] = 0
    const user = new User({ ...req.body });
    user.save((error, user) => {
        if (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    error: `${Object.keys(error.keyValue)[0]} ${error.keyValue[Object.keys(error.keyValue)[0]]} is already registered with an account`
                });
            }
            return res.status(400).json({
                error: "Sign up failed, please try again later",
                message: error
            });
        }
        User.findByIdAndUpdate(
            { _id: user._id },
            { $set: { verification_otp: generateRandomOtp() } },
            { new: true, useFindAndModify: false },
            (error, usr) => {
                if (error) {
                    return res.status(400).json({
                        error: "Sign up failed, please try again later"
                    });
                }
                fetch(`http://sms.ssdindia.com/api/sendhttp.php?authkey=${process.env.SMSKEY}&mobiles=${usr.contact_no}&message=OTP for sarvam is: ${usr.verification_otp}&sender=${process.env.SENDER}&route=4`).then(response => {
                    response.text()
                }).then(data => {
                    console.log(data);
                    res.json({
                        message: "Account created successfully, check contact number for verification OTP"
                    });
                })
            }
        );
    });
};

exports.vendor_sign_up = (req, res) => {
    const form = formidable();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {

        if (error) {
            return res.status(400).json({error: "Problem with uploaded image"});
        }

        // Destructure the fields
        const {username,email,category_opted,contact_no,bank_account_no,firstname,lastname,shop_name,street_address,city,state,pincode,password} = fields;
        const {shop_thumbnail} = files;


        let user = new User(fields);
        user["role"] = 5

        if (!username || !email || !category_opted || !contact_no || !bank_account_no || !firstname || !lastname || !shop_name || !shop_thumbnail || !street_address || !city || !state || !pincode || !password) {
            return res.status(400).json({error: "Please include all fields"});
        }

        // handle files here
        if (files.shop_thumbnail) {
            if (files.shop_thumbnail.size > 1000000) {
                return res.status(400).json({error: "Shop thumbnail size too big"});
            }

            uploadShopThumbnail(files).then((d) => {
                user.shop_thumbnail = `${
                    d[0].metadata.name
                }`;
                // save to db
                user.save((error, user) => {
                    if (error) {
                        if (error.code === 11000) {
                            return res.status(400).json({
                                error: `${Object.keys(error.keyValue)[0]} ${error.keyValue[Object.keys(error.keyValue)[0]]} is already registered with an account`
                            });
                        }
                        return res.status(400).json({
                            error: "Sign up failed, please try again later",
                            message: error
                        });
                    }
                    User.findByIdAndUpdate(
                        { _id: user._id },
                        { $set: { verification_otp: generateRandomOtp() } },
                        { new: true, useFindAndModify: false },
                        (error, usr) => {
                            if (error) {
                                return res.status(400).json({
                                    error: "Sign up failed, please try again later"
                                });
                            }
                            fetch(`http://sms.ssdindia.com/api/sendhttp.php?authkey=${process.env.SMSKEY}&mobiles=${usr.contact_no}&message=OTP for sarvam is: ${usr.verification_otp}&sender=${process.env.SENDER}&route=4`).then(response => {
                                response.text()
                            }).then(data => {
                                console.log(data);
                                return res.json({
                                    message: "Account created successfully, check contact number for verification OTP"
                                });
                            })
                        }
                    );
                });
            }).catch((error) => {
                return res.status(400).json({error: "Error occured while uploading shop thumbnail", reason: error});
            });
        }
    });
};

// Signout controller
exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User signout successfully"
    });
};

// Signin controller
exports.signin = (req, res) => {
    const { contact_no, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        });
    }

    User.findOne({ contact_no }).populate('category_opted').exec((error, user) => {
        if (error || !user)
            return res.status(400).json({
                error: "User with this contact number does not exists!"
            });
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Contact Number and Password do not match!"
            });
        }
        if (!user.verified) {
            return res.status(401).json({
                error: "Contact number not verified",
                verified: false
            });
        }

        // create token
        var token = null;

        if (user.role === 0) {
            token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, process.env.SECRET);
        } else if (user.role === 5) {
            token = jwt.sign({ _id: user._id, username: user.username, role: user.role, category_opted: user.category_opted, vendor_reg_payment_status: user.vendor_reg_payment_status , vflag: (user.category_opted && user.category_opted.is_service) ? user.category_opted.is_service : false }, process.env.SECRET);
        } else if (user.role === 9) {
            token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, process.env.SECRET);
        }
        // put token in cookie
        res.cookie("token", token, { expire: new Date() + 9999 });
        // send response to front end
        const { _id, username, role, vendor_reg_payment_status } = user;
        return res.json({
            token,
            user: {
                _id,
                username,
                role,
                vendor_reg_payment_status,
                vflag: (user.category_opted && user.category_opted.is_service) ? user.category_opted.is_service : false
            },
            message: "Sign In Successfull"
        });
    });
};


// protected routes
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth",
    algorithms: ['HS256']
});
// ? After this the decoded JWT payload is available on the request via the auth property


// custom middlewares

exports.isAuthenticated = (req, res, next) => {
    if (req.auth && req.auth._id) {
        User.findById(req.auth._id, (error, user) => {
            if (error) {
                return res.status(403).json({
                    error: "Forbidden! no user found"
                });
            }
            let checker = user && req.auth && user._id == req.auth._id;
            if (!checker) {
                return res.status(403).json({
                    error: "Forbidden! no user found"
                });
            }
            next()
        })
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.auth.role !== 9) {
        return res.status(401).json({
            error: "Unauthorized user"
        });
    }
    next();
};

exports.isVendor = (req, res, next) => {
    if (req.auth.role !== 5) {
        return res.status(401).json({
            error: "Unauthorized user",
            user: req.auth
        });
    }
    User.findOne({ _id: req.auth._id }, (error, vendor) => {
        if (error) {
            return res.status(401).json({
                error: "Unauthorized user",
                user: req.auth
            });
        } else {
            req.auth["category_opted"] = vendor.category_opted
        }
    })
    next();
};


exports.isProductVendor = (req, res, next) => {
    // req.auth.role !== 9 && (
    if (req.auth.role !== 5 && req.auth.vflag !== false) {
        return res.status(401).json({
            error: "Unauthorized user",
            user: req.auth
        });
    }
    User.findOne({ _id: req.auth._id }, (error, vendor) => {
        if (error) {
            return res.status(401).json({
                error: "Unauthorized user",
                user: req.auth
            });
        } else {
            req.auth["category_opted"] = vendor.category_opted
        }
    })
    next();
};

exports.isServiceVendor = (req, res, next) => {
    // req.auth.role !== 9 && (
    if (req.auth.role !== 5 && req.auth.vflag !== false) {
        return res.status(401).json({
            error: "Unauthorized user",
            user: req.auth
        });
    }
    User.findOne({ _id: req.auth._id }, (error, vendor) => {
        if (error) {
            return res.status(401).json({
                error: "Unauthorized user",
                user: req.auth
            });
        } else {
            req.auth["category_opted"] = vendor.category_opted
        }
    })
    next();
};