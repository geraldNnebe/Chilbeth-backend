const mongoose = require('mongoose');
const canAccess = require('./checkUser').checkUser; // Used to check user priviledges
const Work = mongoose.model("Work");

const workFetchAll = (req, res) => {
    Work.find()
        .exec((err, works) => {
            if (!works) {
                return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
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

const workFetchSome = (req, res) => {
    var perPage = 12, currentPageNumber = +req.params.page > 0 ? +req.params.page : 1; // The + casts string to number
    Work.find()
        .skip(perPage * (currentPageNumber - 1))
        .limit(perPage)
        .sort({ createdOn: 'desc' })
        .exec((err, works) => {
            if (!works) {
                return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
                    .json({
                        "message": "no Works"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            Work.count().exec((err, count) => {
                res.status(200)
                    .json({
                        items: works,
                        pageInformation: {
                            itemsFetched: works.length,
                            itemsPerPage: perPage,
                            grandTotalNumberOfItems: count,
                            currentPageNumber: currentPageNumber,
                            totalNumberOfPages: Math.ceil(count / perPage)
                        }
                    });
            });
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
    canAccess(req, res, (req, res, author) => {
        Work.create({
            author: author.email,
            title: req.body.title,
            imageSortHash: req.body.sortingHash,
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
    canAccess(req, res, (req, res, author) => {
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
    canAccess(req, res, (req, res, author) => {
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
    workFetchSome,
    workReadOne,
    workCreate,
    workUpdateOne,
    workDeleteOne
}