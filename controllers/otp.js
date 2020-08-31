const { validationResult } = require("express-validator");
const User = require("../models/user");
const fetch = require("node-fetch")
const { generateRandomOtp } = require("../utils/otp")

exports.verifyOtp = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg,
            param: errors.array()[0].param
        });
    }
    User.findOne(
        { contact_no: req.body.contact_no },
        (error, user) => {
            if (error) {
                return res.status(400).json({
                    error: "Something went wrong !",
                    error_details: error,
                    message: String(error)
                });
            }
            else if (user === null) {
                return res.json({
                    message: "No user found with this Contact Number",
                    verified: false
                })
            }
            else if (user.verified === true) {
                return res.json({
                    message: "Already verified",
                    verified: true
                })
            }
            else if (user && req.body.otp === user.verification_otp) {
                User.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { verified: true, verification_otp: null } },
                    { new: true, useFindAndModify: false },
                    (error, user) => {
                        if (error) {
                            return res.status(400).json({
                                error: "Verification unsuccessful",
                                error_details: error,
                                message: String(error)
                            });
                        }
                        return res.json({
                            message: "Verification successful",
                            verified: true
                        });
                    }
                );
            } else {
                return res.json({
                    message: "OTP Invalid",
                    verified: false
                })
            }
        }
    );
};


exports.generateOtp = (req, res) => {
    const OTP = generateRandomOtp();
    User.findOne(
        { contact_no: req.body.contact_no },
        (error, user) => {
            if (error) {
                return res.status(400).json({
                    error: "Something went wrong 1!",
                    error_details: error,
                    message: String(error)
                });
            }
            else if (user && user.verified == true) {
                return res.json({
                    message: "Already verified"
                })
            }
            else if (user.verified !== true) {
                User.findByIdAndUpdate(
                    { _id: user._id },
                    { $set: { verification_otp: OTP } },
                    { new: true, useFindAndModify: false },
                    (error, usr) => {
                        if (error) {
                            return res.status(400).json({
                                error: "Something went wrong 2",
                                error_details: error,
                                message: String(error)
                            });
                        }
                        fetch(`http://sms.ssdindia.com/api/sendhttp.php?authkey=${process.env.SMSKEY}&mobiles=${usr.contact_no}&message=OTP for sarvam is: ${OTP}&sender=${process.env.SENDER}&route=4`).then(response => {
                            response.text()
                        }).then(data => {
                            console.log(data);                            
                            return res.json({
                                message: "6 digit OTP Sent, please check your contact number"
                            });
                        })
                    }
                );
            }
            else {
                return res.json({
                    error: "Account with this contact number does not exists"
                });
            }
        }
    );
}