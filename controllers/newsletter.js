const mongoose = require('mongoose');
const Newsletter = mongoose.model("Newsletter");
const canAccess = require('../controllers/checkUser').checkUser;

const contactFetchAll = (req, res) => { // TODO should not fetch the post, since it will be too long
    canAccess(req, res, (req, res, author) => {
        Newsletter.find()
            .exec((err, newsletter) => {
                if (!newsletter) {
                    return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
                        .json({
                            "message": "no blogs"
                        });
                } else if (err) {
                    return res.status(404)
                        .json(err);
                }
                res.status(200)
                    .json(newsletter);
            });
    });
}

const contactCreate = function (req, res) {
    Newsletter.create({
        email: req.body.email
    }, (err, newsletter) => {
        if (err) {
            res.status(400)
                .json(err);
        } else {
            res.status(201)
                .json(newsletter);
        }
    });
};

module.exports = {
    contactFetchAll,
    contactCreate
}