const Service = require("../models/service");
const User = require("../models/user");

exports.getServiceById = (req, res, next, id) => {
    Service.findById(id).exec((error, prod) => {
        if (error) {
            return res.status(400).json({
                error: "Service not found!"
            });
        }
        req.service = prod;
        next();
    });
};

exports.createService = (req, res) => {
    const vendorService = req.body
    vendorService["vendor_id"] = req.auth._id
    vendorService["category_opted"] = req.auth.category_opted
    const service = new Service(vendorService);
    console.log(service)
    Service.find({vendor_id: req.auth._id, parent_sub_category: vendorService.parent_sub_category}).exec((err, doc)=>{
        if(err) {
            return res.status(400).json({
                error: "No services found"
            });            
        } else if(doc.length > 0) {
            return res.status(400).json({
                error: "You cannot opt for a service more than once"
            });
        } else {
            service.save((err, savedService) => {
                if (err) {
                    return res.status(400).json({
                        error: "Failed to save service"
                    });
                }
                return res.json({ message: "Service saved", savedService });
            });
        }
    })
};

exports.getService = (req, res) => {
    return res.json(req.service);
};

exports.getAllServices = (req, res) => {
    if(req.query.vendor_id) {
		Service.find({vendor_id: req.query.vendor_id}).populate("parent_sub_category").populate("vendor_id",{role: 0, verified: 0, blocked: 0, bank_account_no: 0, salt: 0, encry_password: 0, verification_otp: 0,contact_no: 0,email:0}).exec((err, services) => {
			if (err) {
				return res.status(400).json({
				    error: "No services found"
				});
			}
			res.json(services);
		});    
    }    
    else if(req.query.parent_sub_category) {
		Service.find({parent_sub_category: req.query.parent_sub_category}).populate("parent_sub_category").populate("vendor_id",{role: 0, verified: 0, blocked: 0, bank_account_no: 0, salt: 0, encry_password: 0, verification_otp: 0,contact_no: 0,email:0}).exec((err, services) => {
			if (err) {
				return res.status(400).json({
				    error: "No services found"
				});
			}
			res.json(services);
		});    
    } else {
		Service.find().populate("parent_sub_category").populate("vendor_id",{role: 0, verified: 0, blocked: 0, bank_account_no: 0, salt: 0, encry_password: 0, verification_otp: 0,contact_no: 0,email:0}).exec((err, services) => {
			if (err) {
				return res.status(400).json({
				    error: "No services found"
				});
			}
			res.json(services);
		});    
    }
};


exports.getAllServicesByVendorId = (req, res) => {
	console.log(req.auth);
    Service.find({_id: req.auth.category_opted, vendor_id: req.auth._id}).populate("parent_sub_category").populate("vendor_id",{role:0, verified: 0, blocked: 0, bank_account_no: 0, salt: 0, encry_password: 0, verification_otp: 0,contact_no: 0,email:0}).exec((err, services) => {
        if (err) {
            return res.status(400).json({
                error: "No services found"
            });
        }
        res.json(services);
    });
};

exports.updateService = (req, res) => {
    const service = req.service;
    if (service) {
        service.price = req.body.price ? req.body.price : service.price
        if ((service.vendor_id == req.auth._id && req.auth.role === 5 && req.auth.vflag === true) || req.auth.role === 9) {
            service.save((err, updatedService) => {
                if (err) {
                    return res.status(400).json({
                        error: "Failed to update service",
                        err
                    });
                } else {
                    return res.json({ message: "Service updated", updatedService });
                }
            });
        }
    } else {
        return res.status(400).json({
            error: "Failed to update service"
        })
    }
}

exports.removeService = (req, res) => {
    const service = req.service;
    if (service) {
        if ((service.vendor_id == req.auth._id && req.auth.role === 5 && req.auth.vflag === true) || req.auth.role === 9) {
            service.remove((err, removedService) => {
                if (err) {
                    return res.status(400).json({
                        error: "Failed to delete the service"
                    });
                }
                else {
                    return res.json({
                        message: "Successfully deleted"
                    });
                }
            });
        } else {
            return res.status(403).json({
                error: "Forbidden! no user found"
            });
        }
    }
    else {
        return res.status(400).json({
            error: "Service already deleted or was not present"
        });
    }
};