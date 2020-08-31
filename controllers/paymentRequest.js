const PaymentRequest = require("../models/paymentRequest");


exports.createPaymentRequest = (req, res) => {
    const paymentRequest = new PaymentRequest(req.body)
    paymentRequest.save((err, details) => {
        if (err) {
            return res.status(400).json({"error": err})
        } else if (details) {
            if (details.paymentLink) {
                return res.status(200).json({message: "Payment request succesfull", details})
            }
            else{
                details.remove((err, doc)=>{
                    return res.status(400).json({"error": "Cannot process request at the moment"})
                })
            }
        }
    })
}
