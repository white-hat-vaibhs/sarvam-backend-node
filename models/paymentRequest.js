const mongoose = require("mongoose");
var crypto = require('crypto');
const fetch = require("node-fetch")
const C_API = "https://test.cashfree.com/api/v1"

const paymentRequestSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    orderAmount: {
        type: String,
        required: true
    },
    orderNote: {
        type: String,
        required: false
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    paymentLink: {
        type: String,
        required: false
    },
    signature: {
        type: String,
        required: false
    },
    message: {
        type: String,
        required: false
    }
}, {timestamps: true});

paymentRequestSchema.pre("save", function (next) {
    const params = new URLSearchParams();
    var self = this;

    var requestData = {
        appId: `${process.env.APPID}`,
        secretKey: `${process.env.SECRETKEY}`,
        orderId: `${self.orderId}`,
        orderAmount: `${self.orderAmount}`,
        orderCurrency: `INR`,
        orderNote: `${self.orderNote}`,
        customerEmail: `${self.customerEmail}`,
        customerName: `${self.customerName}`,
        customerPhone: `${self.customerPhone}`,
        returnUrl: "https://ca18e6a18b21.ngrok.io",
        notifyUrl: "https://ca18e6a18b21.ngrok.io/api/payment_webhook",
    };   

    var secretKey = process.env.SECRETKEY;
    var sortedkeys = Object.keys(requestData);
    var signatureData = "";

    sortedkeys.sort();

    for (var i = 0; i < sortedkeys.length; i++) {
        k = sortedkeys[i];
        signatureData += k + requestData[k];
    }

    for (var k in requestData) {
        params.append(k, requestData[k])
    }

    var signature = crypto.createHmac('sha256', secretKey).update(signatureData).digest('base64');

    self.signature = signature;

    fetch(`${C_API}/order/create`, {
        method: "post",
        headers: {
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded"
        },
        body: params
    }).then(r => r.json()).then(data => {
        if (data.status === "OK") {
            self.message = data.status;
            self.paymentLink = data.paymentLink
            next()
        } else if (data.status === "ERROR") {
            self.message = data.status + " " + data.reason;
            next()
        }
    }).catch(error => {
        console.log(error);
        self.message = JSON.stringify(error);
        next()
    })
})

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
