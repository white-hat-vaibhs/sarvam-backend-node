const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const invoiceSchema = new mongoose.Schema(
    {
        transaction_id: {
            type: String,
            required: true
        },
        transaction_date: {
            type: Date,
            required: true
        },        
        user_id: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: Array,
            default: []
        },
        total: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Invoice", invoiceSchema);