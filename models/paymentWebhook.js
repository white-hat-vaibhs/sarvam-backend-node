const mongoose = require("mongoose");

const paymentWebhookSchema = new mongoose.Schema(
    {
        response_body: {
            type: Object
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("PaymentWebhook", paymentWebhookSchema);