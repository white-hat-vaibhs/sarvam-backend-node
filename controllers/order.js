const Service = require("../models/service");
const Product = require("../models/product");
const User = require("../models/user");

exports.isValidOrder = (req, res, next) => {
    User.findById(req.body.vendor_id).exec((err, doc) => {
        if (err) {
            return res.status(400).json({error: "Bill details are invalid", cflag: true})
        } else if (req.body.order_items) {
            const total_items = req.body.order_items.length;
            var sDetails = []
            var pDetails = []
            req.body.order_items.map(item => {
                Service.findById(item._id, (err, service) => {
                    if (err) {} else if (service) {
                        console.log({
                            service,
                            quantity: item.quantity,
                            total: item.quantity * service.price
                        });
                        sDetails.push({
                            service,
                            quantity: item.quantity,
                            total: item.quantity * service.price
                        })
                    }
                })
                Product.findById(item._id, (err, product) => {
                    if (err) {} else if (product) {
                        console.log({
                            product,
                            quantity: item.quantity,
                            total: item.quantity * product.price
                        });
                        pDetails.push({
                            product,
                            quantity: item.quantity,
                            total: item.quantity * product.price
                        })
                    }
                })
            })
            if (pDetails.length === total_items) {
                res["order_info"] = pDetails
            } else if (sDetails.length === total_items) {
                res["order_info"] = sDetails
            } else {
                return res.status(400).json({error: "Bill details are invalid", cflag: true})
            }
            next();
        } else {
            return res.status(400).json({error: "Bill details are invalid", cflag: true})
        }
    })
}

exports.generateOrderPaymentLink = (req, res) => {
    return res.json(req.order_info)
}
