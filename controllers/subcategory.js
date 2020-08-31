const SubCategory = require("../models/subcategory");
const Category = require("../models/category");
const formidable = require("formidable");
const {uploadFile} = require("../utils/gcp")
const _ = require("lodash")

exports.getSubCategoryById = (req, res, next, id) => {
    SubCategory.findById(id).populate("parent_category_id").exec((error, sub_category) => {
        if (error) {
            return res.status(400).json({
                error: "Sub-category not found!"
            });
        }
        req.subcategory = sub_category;
        next();
    });
};

exports.getAllSubCategoriesByParentCategoryId = (req, res, next, id) => {
    SubCategory.find({ parent_category_id: id }).exec((err, subCategories) => {
        if (err) {
            return res.status(400).json({
                error: "No categories found"
            });
        }
        res.json(subCategories);
    });
};

exports.createSubCategory = (req, res) => {
    const form = formidable();
    form.keepExtensions = true;

    form.parse(req, (error, fields, files) => {

        if (error) {
            return res.status(400).json({error: "Problem with uploaded image"});
        }

        // Destructure the fields
        const {title, parent_category_id, unit_of_measurment} = fields;
        const {thumbnail} = files;


        let subcategory = new SubCategory(fields);

        if (!title || !thumbnail || !parent_category_id || !unit_of_measurment) {
            return res.status(400).json({error: "Please include all fields"});
        }

        Category.findById(parent_category_id, (error, cat) => {
            if(error){
                return res.status(400).json({
                    error: "Error, Please try again"
                });
            }
            else if(cat.is_service === false) {
                return res.status(400).json({
                    error: "Parent category needs to be of type: service"
                });
            }
        })

        // handle files here
        if (files.thumbnail) {
            if (files.thumbnail.size > 1000000) {
                return res.status(400).json({error: "File size too big"});
            }

            uploadFile(files).then((d) => {
                subcategory.thumbnail = `${
                    d[0].metadata.name
                }`;
                // save to db
                subcategory.save((error, subcategory) => {
                    if (error) {
                        return res.status(400).json({error: "Failed to save subcategory", reason: error});
                    }
                    res.json(subcategory);
                })
            }).catch((error) => {
                return res.status(400).json({error: "Error occured while uploading thumbnail", reason: error});
            });
        }
    });
};

exports.getSubCategory = (req, res) => {
    return res.json(req.subcategory);
};

exports.getAllSubCategories = (req, res) => {
    SubCategory.find().populate("parent_category").exec((err, subCategories) => {
        if (err) {
            return res.status(400).json({
                error: "No categories found"
            });
        }
        res.json(subCategories);
    });
};

exports.getAllSubCategoriesByVendor = (req,res) => {
    SubCategory.find({ parent_category_id: req.auth.category_opted }).populate("parent_category").exec((err, subCategories) => {
        if (err) {
            return res.status(400).json({
                error: "No categories found"
            });
        }
        res.json(subCategories);
    });
}

exports.updateSubCategory = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({error: "Problem with thumbnail"});
        }

        // updation code
        var subcategory = req.subcategory;
        fields["parent_category_id"] = req.subcategory.parent_category_id._id;
        subcategory = _.extend(subcategory, fields);
        console.log(subcategory);

        if (subcategory) {
            if (files.thumbnail) {
                if (files.thumbnail.size > 1000000) {
                    return res.status(400).json({error: "Thumbnail size too big"});
                }
                uploadFile(files).then((d) => {
                    subcategory.thumbnail = `${
                        d[0].metadata.name
                    }`;
                    // save to db
                    subcategory.save((err, updatedSubCategory) => {
                        if (err) {
                            return res.status(400).json({error: "Failed to update subcategory",err});
                        }
                        else return res.json({message: "Subcategory updated", updatedSubCategory});
                    });
                }).catch((error) => {
                    return res.status(400).json({error: "Error occured while uploading thumbnail", reason: error});
                });
            } else {
                subcategory.save((err, updatedCategory) => {
                    if (err) {
                        return res.status(400).json({error: "Failed to update subcategory",err});
                    }
                    else return res.json({message: "Subcategory updated", updatedCategory});
                });
            }
        } else {
            return res.status(400).json({error: "Failed to update subcategory"});
        }
    });
};

exports.removeSubCategory = (req, res) => {
    const subcategory = req.subcategory;
    if (subcategory) {
        subcategory.remove((err, removedSubCategory) => {
            if (err) {
                return res.status(400).json({
                    error: "Failed to delete the subcategory"
                });
            }
            res.json({
                message: "Successfully deleted : " + removedSubCategory.title
            });
        });
    }
    else {
        return res.status(400).json({
            error: "Sub-Category already deleted or was not present"
        });
    }    
};