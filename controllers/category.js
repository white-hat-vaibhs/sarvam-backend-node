const Category = require("../models/category");
const formidable = require("formidable");
const { uploadFile } = require("../utils/gcp")
const _ = require("lodash")

exports.getCategoryById = (req, res, next, id) => {
    Category.findById(id).exec((error, cate) => {
        if (error) {
            return res.status(400).json({
                error: "Category not found!"
            });
        }
        req.category = cate;
        next();
    });
};

exports.createCategory = (req, res) => {

    const form = formidable();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {

        if (error) {
            return res.status(400).json({
                error: "Problem with uploaded image",
            });
        }

        // Destructure the fields
        const { title, is_service } = fields;
        const { thumbnail } = files;
        

        let category = new Category(fields);

        if (!title || !thumbnail || !is_service) {
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
                    category.thumbnail = `${d[0].metadata.name}`;
                    // save to db
                    category.save((error, category) => {
                        if (error) {
                            return res.status(400).json({
                                error: "Failed to save category",
                                reason: error
                            });
                        }
                        res.json(category);
                    })
                })
                .catch((error) => {
                    return res.status(400).json({
                        error: "Error occured while uploading thumbnail",
                        reason: error
                    });
                });
        }
    });
};

exports.getCategory = (req, res) => {
    return res.json(req.category);
};

exports.getAllCategories = (req, res) => {
    Category.find().exec((error, categories) => {
        if (error) {
            return res.status(400).json({
                error: "No categories found"
            });
        }
        res.json(categories);
    });
};

exports.getAllProductCategories = (req, res) => {
    Category.find({ is_service: false }).exec((error, categories) => {
        if (error) {
            return res.status(400).json({
                error: "No categories found"
            });
        }
        res.json(categories);
    });
}

exports.getAllServiceCategories = (req, res) => {
    Category.find({ is_service: true }).exec((error, categories) => {
        if (error) {
            return res.status(400).json({
                error: "No categories found"
            });
        }
        res.json(categories);
    });
}

exports.updateCategory = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({error: "Problem with thumbnail"});
        }

        // updation code
        var category = req.category;
        category = _.extend(category, fields);
        category["is_service"] = req.category.is_service === true ? req.category.is_service : fields.is_service
        console.log(category);

        if (category) {
            if (files.thumbnail) {
                if (files.thumbnail.size > 1000000) {
                    return res.status(400).json({error: "Thumbnail size too big"});
                }
                uploadFile(files).then((d) => {
                    category.thumbnail = `${
                        d[0].metadata.name
                    }`;
                    // save to db
                    category.save((err, updatedCategory) => {
                        if (err) {
                            return res.status(400).json({error: "Failed to update category",err});
                        }
                        else return res.json({message: "Category updated", updatedCategory});
                    });
                }).catch((error) => {
                    return res.status(400).json({error: "Error occured while uploading thumbnail", reason: error});
                });
            } else {
                category.save((err, updatedCategory) => {
                    if (err) {
                        return res.status(400).json({error: "Failed to update Category",err});
                    }
                    else return res.json({message: "Category updated", updatedCategory});
                });
            }
        } else {
            return res.status(400).json({error: "Failed to update category"});
        }
    });
};

exports.removeCategory = (req, res) => {
    const category = req.category;
    if (category) {
        category.remove((error, removedCategory) => {
            if (error) {
                return res.status(400).json({
                    error: "Failed to delete the category"
                });
            }
            res.json({
                message: "Successfully deleted : " + removedCategory.title
            });
        });
    }
    else {
        return res.status(400).json({
            error: "Category already deleted or was not present"
        });
    }
};