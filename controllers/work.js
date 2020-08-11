const mongoose = require('mongoose');
const canAccess = require('./check-user').checkUser; // Used for checking user priviledges
const WorkCategory = mongoose.model('WorkCategory');
const Work = mongoose.model('Work');
const deleteImageFromDB = require('./upload').deleteFromDatabase;

const workCategoryFetchAll = (req, res) => {
    WorkCategory.find()
        .exec((err, categories) => {
            if (!categories) {
                // The return statement here stops every other thing from running in the function,
                // after res.status().json() has finished executing
                return res.status(404)
                    .json({ message: "No categories" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(categories);
        });
}

const workCategoryCreate = (req, res) => {
    canAccess(req, res, (req, res, author) => {
        WorkCategory.create({
            title: req.body.title,
        }, (err, category) => {
            if (err) {
                res.status(400)
                    .json(err);
            } else {
                res.status(201)
                    .json(category);
            }
        });
    });
}

const workCategoryUpdate = (req, res) => {
    canAccess(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
        WorkCategory.findById(req.params.categoryid)
            .exec((err, category) => {
                if (!category) {
                    return res.status(404)
                        .json({ message: "Category does not exist" });
                } else if (err) {
                    return res.status(400)
                        .json(err);
                }
                category.title = req.body.title;
                category.numberOfWorks = req.body.numberOfWorks;
                category.save((err, category) => {
                    if (err) {
                        res.status(404)
                            .json(err);
                    } else {
                        res.status(200)
                            .json(category);
                    }
                });
            });
    });
}

const workCategoryDelete = (req, res) => {
    canAccess(req, res, (req, res, author) => {
        const { categoryid } = req.params;
        fetchCategory(categoryid, (err, category) => {
            if (err)
                return res.status(404)
                    .json({ message: "Category does not exist" });
            if (category.numberOfWorks > 0)
                return res.status(400)
                    .json({ message: "Category is not empty" });
            WorkCategory.findByIdAndRemove(categoryid)
                .exec((err, category) => {
                    if (err) {
                        return res.status(404)
                            .json(err);
                    }
                    res.status(204)
                        .json(null);
                })

        });
    });
}

// CAUTION: payload size may be too much. Use workFetchSome instead
const workFetchAll = (req, res) => {
    Work.find()
        .exec((err, works) => {
            if (!works) {
                return res.status(404)
                    .json({ message: "No works" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(works);
        });
}

const workFetchSome = (req, res) => {
    var perPage = 6, currentPageNumber = +req.params.page > 0 ? +req.params.page : 1; // The + casts a string to number
    Work.find({ isFeatured: true })
        .skip(perPage * (currentPageNumber - 1))
        .limit(perPage)
        .sort({ createdOn: 'desc' })
        .exec((err, works) => {
            if (!works) {
                return res.status(404)
                    .json({ message: "No works" });
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

const workFetchSomeByCategory = (req, res) => {
    var perPage = 6, currentPageNumber = +req.params.page > 0 ? +req.params.page : 1; // The + casts a string to number
    Work.find({ categoryId: req.params.categoryid })
        .skip(perPage * (currentPageNumber - 1))
        .limit(perPage)
        .sort({ createdOn: 'desc' })
        .exec((err, works) => {
            if (!works) {
                return res.status(404)
                    .json({ message: "No works" });
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
                    .json({ message: "No work" });
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
        const { categoryid } = req.params;
        fetchCategory(categoryid, (err, category) => {
            if (err)
                return res.status(400)
                    .json({ message: "Category does not exist, so work cannot be created" });
            Work.create({
                author: author.email,
                title: req.body.title,
                categoryId: req.body.category,
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
    });
}

const workUpdateOne = (req, res) => {
    canAccess(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
        if (fetchCategory(req.body.categoryId)) // Does the category exist?
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
                    work.categoryId = req.body.categoryId;
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
        else
            return res.status(400)
                .json({ message: "Category does not exist, so work cannot be created" });
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
                    // Delete uploaded image after deleting work
                    deleteImageFromDB(work.imageSortHash);
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
    workCategoryFetchAll,
    workCategoryCreate,
    workCategoryUpdate,
    workCategoryDelete,
    workFetchAll,
    workFetchSome,
    workFetchSomeByCategory,
    workReadOne,
    workCreate,
    workUpdateOne,
    workDeleteOne
}

// WARNING: This method must not be exposed as API
const fetchCategory = (categoryId, callback) => {
    error = true;
    WorkCategory.findById(categoryId)
        .exec((err, category) => {
            if (!category) {
                callback(error, null);
            } else if (err) {
                callback(error, null);
            }
            callback(null, category);
        });
}