const PaymentWebhook = require("../models/paymentWebhook");


exports.createPaymentEntry = (req, res) => {
    const newPayment = new PaymentWebhook({response_body: req.body})
    newPayment.save((err, details) => {
        if (err) {
            return res.stat(400).json({"error": err})
        } else if (details) {
            return res.status(200).json({message: "Payment webhook details saved succesfully", details})
        }
    })
}
