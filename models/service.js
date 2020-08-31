const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const serviceSchema = new mongoose.Schema(
    {
        parent_sub_category: {
            type: ObjectId,
            ref: "SubCategory",
            required: true
        },
        vendor_id: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Service", serviceSchema);