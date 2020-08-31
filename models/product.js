const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        thumbnail: {
            type: String,
            required: true,
            trim: true,
        },
        vendor_id: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: ObjectId,
            ref: "Category",
            required: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        unit_of_measurment: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);