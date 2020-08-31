const User = require("../models/user");

exports.generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

exports.generateOtpHelper = (contact_no) => {
    const OTP = Math.floor(100000 + Math.random() * 900000);
    User.findOne(
        { contact_no: contact_no },
        (error, user) => {
            if (error) {
                return false
            }
            else if (user.verified === true || user.verification_otp === null) {
                return false
            }
            User.findByIdAndUpdate(
                { _id: user._id },
                { $set: { verified: true, verification_otp: null } },
                { new: true, useFindAndModify: false },
                (error, user) => {
                    if (error) {
                        return false
                    }
                    fetch(`http://sms.ssdindia.com/api/sendhttp.php?authkey=${process.env.SMSKEY}&mobiles=${contact_no}&message=OTP for sarvam is: ${OTP}&sender=${process.env.SENDER}&route=4`).then(response => {
                        response.json()
                    }).then(data => {
                        return true
                    })
                }
            );
        }
    );
}