const mongoose = require('mongoose');
const canAccess = require('./check-user').checkUser; // Used for checking user priviledges
const Exhibition = mongoose.model('Exhibition');
const deleteImageFromDB = require('./upload').deleteFromDatabase;

const exhibitionFetchSome = (req, res) => {
    var perPage = 6, currentPageNumber = +req.params.page > 0 ? +req.params.page : 1;
    Exhibition.find({ isFeatured: true })
        .skip(perPage * (currentPageNumber - 1))
        .limit(perPage)
        .sort({ createdOn: 'desc' })
        .exec((err, exhibitions) => {
            if (!exhibitions) {
                return res.status(404)
                    .json({ message: "No exhibitions" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            Exhibition.count({ isFeatured: true }).exec((err, count) => {
                res.status(200)
                    .json({
                        items: exhibitions,
                        pageInformation: {
                            itemsFetched: exhibitions.length,
                            itemsPerPage: perPage,
                            grandTotalNumberOfItems: count,
                            currentPageNumber: currentPageNumber,
                            totalNumberOfPages: Math.ceil(count / perPage)
                        }
                    });
            });
        });
}

const exhibitionReadOne = (req, res) => {
    Exhibition.findById(req.params.exhibitionid)
        .exec((err, exhibition) => {
            if (!exhibition) {
                return res.status(404)
                    .json({ message: "No exhibition" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(exhibition);
        });
}

const exhibitionCreate = function (req, res) {
    canAccess(req, res, (req, res, author) => {
        Exhibition.create({
            author: author.email,
            title: req.body.title,
            imageSortHash: req.body.sortingHash,
            desc: req.body.desc,
            videoUrl: req.body.videoUrl
        }, (err, exhibition) => {
            if (err) {
                res.status(400)
                    .json(err);
            } else {
                res.status(201)
                    .json(exhibition);
            }
        });
    });
}

const exhibitionUpdateOne = (req, res) => {
    canAccess(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
        Exhibition.findById(req.params.exhibitionid)
            .exec((err, exhibition) => {
                if (!exhibition) {
                    return res.status(404)
                        .json({ message: "Exhibition not found" });
                } else if (err) {
                    return res.status(400)
                        .json(err);
                }
                exhibition.title = req.body.title;
                exhibition.isFeatured = req.body.featured;
                exhibition.desc = req.body.desc;
                work.videoUrl = req.body.videoUrl;
                exhibition.save((err, exhibition) => {
                    if (err) {
                        res.status(404)
                            .json(err);
                    } else {
                        res.status(200)
                            .json(exhibition);
                    }
                });
            });
    });
}

const exhibitionDeleteOne = (req, res) => {
    canAccess(req, res, (req, res, author) => {
        const { exhibitionid } = req.params;
        if (exhibitionid) {
            Exhibition.findByIdAndRemove(exhibitionid)
                .exec((err, exhibition) => {
                    if (err) {
                        return res.status(404)
                            .json(err);
                    }
                    // Delete uploaded image after deleting exhibition
                    deleteImageFromDB(exhibition.imageSortHash);
                    res.status(204)
                        .json(null);
                })
        } else {
            res.status(404)
                .json({ message: "Exhibition does not exist" });
        }
    });
}

module.exports = {
    exhibitionFetchSome,
    exhibitionReadOne,
    exhibitionCreate,
    exhibitionUpdateOne,
    exhibitionDeleteOne
}
