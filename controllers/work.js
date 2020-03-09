const mongoose = require('mongoose');
const ifEnter = require('./checkUser').checkUser;
const Work = mongoose.model("Work");

const workFetchAll = (req, res) => {
    Work.find()
        .exec((err, works) => {
            if (!works) {
                return res.status(404)
                    .json({
                        "message": "no Works"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(works);
        });
}

const workReadOne = (req, res) => {
    Work.findById(req.params.workid)
        .exec((err, work) => {
            if (!work) {
                return res.status(404)
                    .json({ "message": "no Work" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(work);
        });
}

const workCreate = function (req, res) {
    ifEnter(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
        Work.create({
            author: author.email,
            title: req.body.title,
            image: req.body.image,
            desc: req.body.desc,
        }, (err, work) => {
            if (err) {
                res.status(400)
                    .json(err);
            } else {
                res.status(201)
                    .json(work);
            }
        });
    });
};

const workUpdateOne = (req, res) => { // If JWT was decrypted, and is valid
    ifEnter(req, res, (req, res, author) => {
        Work.findById(req.params.workid)
            .exec((err, work) => {
                if (!work) {
                    return res.status(404)
                        .json({ message: "Work not found" });
                } else if (err) {
                    return res.status(400)
                        .json(err);
                }
                work.title = req.body.title;
                work.image = req.body.image;
                work.desc = req.body.desc;
                work.save((err, work) => {
                    if (err) {
                        res.status(404)
                            .json(err);
                    } else {
                        res.status(200)
                            .json(work);
                    }
                });
            });
    });
}

const workDeleteOne = (req, res) => {
    ifEnter(req, res, (req, res, author) => {
        const { workid } = req.params;
        if (workid) {
            Work.findByIdAndRemove(workid)
                .exec((err, work) => {
                    if (err) {
                        return res.status(404)
                            .json(err);
                    }
                    res.status(204)
                        .json(null);
                })
        } else {
            res.status(404)
                .json({ message: "Work does not exist" });
        }
    });
}

module.exports = {
    workFetchAll,
    workReadOne,
    workCreate,
    workUpdateOne,
    workDeleteOne
}