const mongoose = require("mongoose");
// const { Storage } = require("@google-cloud/storage");
// const storage = new Storage();

const categorySchema = new mongoose.Schema(
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
        is_service: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// categorySchema.pre("remove",(doc) => {
//     const deleteFile = async () => {
//         await storage.bucket(process.env.BUCKET_NAME).file(doc.thumbnail).delete();
//     }
//     deleteFile().catch((err) => {
//         return res.status(400).json({
//             error: "Failed to delete photo",
//             err,
//         });
//     });    
// })

module.exports = mongoose.model("Category", categorySchema);