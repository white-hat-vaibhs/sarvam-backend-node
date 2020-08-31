const Product = require("../models/product");
const formidable = require("formidable");
const { uploadFile } = require("../utils/gcp")
const _ = require("lodash")

exports.getProductById = (req, res, next, id) => {
    Product.findById(id).exec((error, prod) => {
        if (error) {
            return res.status(400).json({
                error: "Product not found!"
            });
        }
        req.product = prod;
        next();
    });
};

exports.createProduct = (req, res) => {
    const form = formidable();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {

        if (error) {
            return res.status(400).json({
                error: "Problem with uploaded thumbnail",
            });
        }

        // Destructure the fields
        const { title, description, price, unit_of_measurment } = fields;
        const { thumbnail } = files;


        let product = new Product(fields);

        if (!title || !description || !price || !unit_of_measurment || !thumbnail) {
            return res.status(400).json({
                error: "Please include all fields"
            });
        }

        // handle files here
        if (files.thumbnail) {
            if (files.thumbnail.size > 1000000) {
                return res.status(400).json({
                    error: "File size too big",
                });
            }

            uploadFile(files)
                .then((d) => {
                    product.thumbnail = `${d[0].metadata.name}`;
                    product["vendor_id"] = req.auth._id
                    product["category"] = req.auth.category_opted
                    // save to db
                    product.save((error, product) => {
                        if (error) {
                            return res.status(400).json({
                                error: "Failed to save product",
                                reason: error
                            });
                        }
                        res.json({ message: "Product created" });
                    });
                })
                .catch((error) => {
                    console.log(error)
                    return res.status(400).json({
                        error: "Error occured while uploading thumbnail",
                        reason: error
                    });
                });
        }
    });
};

exports.getProduct = (req, res) => {
    return res.json(req.product);
};

exports.getAllProducts = (req, res) => {
    if (req.query.vendor_id) {
        Product.find({ vendor_id: req.query.vendor_id })
            .populate("category")
            .populate("vendor_id", { salt: 0, encry_password: 0, verified: 0, bank_account_no: 0, verification_otp: 0 })
            .exec((err, products) => {
                if (err) {
                    return res.status(400).json({
                        error: "No products found"
                    });
                }
                res.json(products);
            });
    }
    else {
        Product.find().populate("category")
            .populate("category")
            .populate("vendor_id", { salt: 0, encry_password: 0, verified: 0, bank_account_no: 0, verification_otp: 0 })
            .exec((err, products) => {
                if (err) {
                    return res.status(400).json({
                        error: "No products found"
                    });
                }
                res.json(products);
            });
    }
};

exports.updateProduct = (req, res) => {

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Problem with thumbnail",
            });
        }

        // updation code
        var product = req.product;
        product = _.extend(product, fields);
        console.log(product);

        if (product) {
            product.category = req.auth.category_opted
            if ((product.vendor_id == req.auth._id && req.auth.role === 5) || req.auth.role === 9) {
                // handle file here
                if (files.thumbnail) {
                    if (files.thumbnail.size > 1000000) {
                        return res.status(400).json({
                            error: "Thumbnail size too big",
                        });
                    }
                    uploadFile(files)
                        .then((d) => {
                            product.thumbnail = `${d[0].metadata.name}`;
                            product["vendor_id"] = req.auth._id
                            product["category"] = req.auth.category_opted
                            // save to db
                            product.save((err, updatedProduct) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Failed to update product"
                                    });
                                }
                                res.json({ message: "Product updated", updatedProduct });
                            });
                        })
                        .catch((error) => {
                            return res.status(400).json({
                                error: "Error occured while uploading thumbnail",
                                reason: error
                            });
                        });
                }
                else {
                    product.save((error, updatedProduct) => {
                        if (error) {
                            return res.status(400).json({
                                error: "Failed to update product",
                                err
                            });
                        } else {
                            return res.json({ message: "Product updated" });
                        }
                    });
                }
            }
        } else {
            return res.status(400).json({
                error: "Failed to update product"
            });
        }
    });
}

exports.removeProduct = (req, res) => {
    const product = req.product;
    if (product) {
        if ((product.vendor_id == req.auth._id && req.auth.vflag === false) || req.auth.role === 9) {
            product.remove((err, removedProduct) => {
                if (err) {
                    return res.status(400).json({
                        error: "Failed to delete the product"
                    });
                }
                res.json({
                    message: "Successfully deleted : " + removedProduct.title
                });
            });
        } else {
            return res.status(403).json({
                error: "Forbidden!"
            });
        }
    }
    else {
        return res.status(400).json({
            error: "Product already deleted or was not present"
        });
    }
};