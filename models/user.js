const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Schema;


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            maxlength: 50,
            trim: true
        },
        firstname: {
            type: String,
            required: false,
            maxlength: 50,
            trim: true
        },
        lastname: {
            type: String,
            required: false,
            maxlength: 50,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true
        },
        contact_no: {
            type: Number,
            trim: true,
            required: true,
            unique: true,
            min: 1000000000,
            max: 9999999999
        },
        shop_name: {
            type: String,
            trim: true,
            required: false
        },
        shop_thumbnail: {
            type: String,
            trim: true,
            required: false
        },        
        bank_account_no: {
            type: Number,
            required: false,
            unique: true,
            sparse: true
        },        
        category_opted: {
            type: ObjectId,
            ref: "Category",
            required: false
        },        
        street_address: {
            type: String,
            trim: true,
            required: false
        },
        city: {
            type: String,
            trim: true,
            required: false
        },
        state: {
            type: String,
            trim: true,
            required: false,
        },
        pincode: {
            type: Number,
            trim: true,
            required: false,
        },
        blocked: {
            type: Boolean,
            default: false
        },
        verified: {
            type: Boolean,
            default: false
        },
        vendor_reg_payment_status: {
            type: String,
            required: false,
            default: "NOT PAID"
        },   
        verification_otp: {
            type: Number,
            max: 999999,
            min: 100000
        },
        reset_password_otp: {
            type: Number,
            max: 999999,
            min: 100000
        },
        encry_password: {
            type: String,
            required: true
        },
        salt: {
            type: String,
            required: true
        },
        role: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

userSchema
    .virtual("password")
    .set(function (password) {
        this._password = password;
        this.salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS))
        this.encry_password = this.securePassword(password);
    })
    .get(function () {
        return this._password;
    });



userSchema.methods = {
    authenticate: function (plainpassword) {
        return bcrypt.compareSync(plainpassword, this.encry_password)
    },
    securePassword: function (plainpassword) {
        if (!plainpassword) return "";
        try {
            salt = this.salt
            return bcrypt.hashSync(plainpassword, salt);
        } catch (error) {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);
