const User = require("../models/user");
const Category = require("../models/category");

exports.getUserById = (req, res, next, id) => {
	User.findById(id).exec((error, user) => {
		if (error || !user) {
			return res.status(400).json({
				error: "No user was found",
			});
		}
		req.profile = user;
		next();
	});
};

exports.getUser = (req, res) => {
	// req.auth.salt = undefined;
	// req.auth.encry_password = undefined;
	// req.auth.createdAt = undefined;
	// req.auth.updatedAt = undefined;
	return res.json(req.auth);
};

exports.getAllUsers = (req, res) => {
	User.find({},{ verification_otp: 0, salt: 0, encry_password: 0}).populate("category_opted").exec((error, users) => {
		if (error || !users) {
			return res.status(400).json({
				error: "No users were found",
			});
		}
		return res.json(users)
	});
};

exports.getAllVendors = (req, res) => {
    User.find({ role: 5 }).exec((err, users) => {
        if (err) {
            return res.status(400).json({
                error: "No vendors found"
            });
        }
        res.json(users);
    });
}

exports.getAllProductVendors = (req, res) => {
	Category.find({ "is_service": false }, (error, categories) => {
		User.find({ category_opted: { $in : categories } }).exec((err, users) => {
			if (err) {
				return res.status(400).json({
					error: "No users found"
				});
			}
			res.json(users);
		});
	})
}

exports.getAllVendorsByCategoryId = (req, res) => {
	User.find({ "category_opted": req.params.categoryId },{bank_account_no: 0, salt: 0, encry_password: 0, verification_otp: 0,contact_no: 0,email:0})
	.populate("category_opted")
	.exec((error, vendors)=> {
			if (error) {
				return res.status(400).json({
					error: "No vendors found"
				});
			}
			res.json(vendors);
		})
}

exports.getVendorById = (req,res) => {
	User.findById(req.params.vendorId,{bank_account_no: 0, salt: 0, encry_password: 0, verification_otp: 0,contact_no: 0,email:0})
	.populate("category_opted")
	.exec((error, vendor)=> {
			if (error) {
				return res.status(400).json({
					error: "No vendor found"
				});
			}
			res.json(vendor);
		})	
}

exports.updateUser = (req, res) => {
	User.findByIdAndUpdate(
		{ _id: req.auth._id },
		{ $set: req.body },
		{ new: true, useFindAndModify: false },
		(error, user) => {
			if (error) {
				return res.status(400).json({
					error: "Update unsuccessful",
				});
			}
			user.salt = undefined;
			user.encry_password = undefined;
			user.createdAt = undefined;
			user.updatedAt = undefined;
			return res.json({
				message: "Updated user",
				updated_user: user
			});
		}
	);
};
