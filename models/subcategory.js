const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const subCategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        thumbnail: {
            type: String,
            required: true,
            trim: true,
        },
        parent_category_id: {
            type: ObjectId,
            ref: "Category",
            required: true
        },
        unit_of_measurment: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);