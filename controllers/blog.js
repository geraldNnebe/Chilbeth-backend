const mongoose = require('mongoose');
const Blog = mongoose.model("Blog");
const canAccess = require('../controllers/checkUser').checkUser;
const getUser = require('../controllers/user');

const blogFetchAll = (req, res) => { // TODO should not fetch the post, since it will be too long
    Blog.find()
        .exec((err, blogs) => {
            if (!blogs) {
                return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
                    .json({
                        "message": "no blogs"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            // Continue if no errors
            blogs.forEach(function (blog) {
                // Add the author's name to each blog entry
                // TODO this requires optimization in the future
                blog.authorName = getUser.getName(blog.authorEmail);
            });
            res.status(200)
                .json(blogs);
        });
}

const blogFetchSome = (req, res) => { // TODO should not fetch the post, since it will be too long
    var perPage = 3, currentPageNumber = +req.params.page > 0 ? +req.params.page : 1; // The + casts string to number
    Blog.find()
        .skip(perPage * (currentPageNumber - 1))
        .limit(perPage)
        .sort({ createdOn: 'asc' })
        .exec((err, blogs) => {
            if (!blogs) {
                return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
                    .json({
                        "message": "no blogs"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            // Continue if no errors
            blogs.forEach(function (blog) {
                // Add the author's name to each blog entry
                // TODO this requires optimization in the future
                blog.authorName = getUser.getName(blog.authorEmail);
            });
            Blog.count().exec((err, count) => {
                res.status(200)
                    .json({
                        items: blogs,
                        pageInformation: {
                            itemsFetched: blogs.length,
                            itemsPerPage: perPage,
                            grandTotalNumberOfItems: count,
                            currentPageNumber: currentPageNumber,
                            totalNumberOfPages: Math.ceil(count / perPage)
                        }
                    });
            });
        });
}

const blogReadOne = (req, res) => {
    Blog.findById(req.params.blogid)
        .exec((err, blog) => {
            if (!blog) {
                return res.status(404)
                    .json({ "message": "no Blog" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(blog);
        });
}

const blogCreate = function (req, res) {
    canAccess(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
        Blog.create({
            author: author.email,
            title: req.body.title,
            post: req.body.post,
            desc: req.body.desc,
            imageSortHash: req.body.sortingHash,
        }, (err, blog) => {
            if (err) {
                res.status(400)
                    .json(err);
            } else {
                res.status(201)
                    .json(blog);
            }
        });
    });
};

const blogUpdateOne = (req, res) => { // If JWT was decrypted, and is valid
    canAccess(req, res, (req, res, author) => {
        Blog.findById(req.params.blogid)
            .exec((err, blog) => {
                if (!blog) {
                    return res.status(404)
                        .json({ message: "Blog not found" });
                } else if (err) {
                    return res.status(400)
                        .json(err);
                }
                blog.title = req.body.title;
                blog.desc = req.body.desc;
                blog.post = req.body.post;
                blog.save((err, blog) => {
                    if (err) {
                        res.status(404)
                            .json(err);
                    } else {
                        res.status(200)
                            .json(blog);
                    }
                });
            });
    });
}

const blogDeleteOne = (req, res) => {
    canAccess(req, res, (req, res, author) => {
        const { blogid } = req.params;
        if (blogid) {
            Blog.findByIdAndRemove(blogid)
                .exec((err, blog) => {
                    if (err) {
                        return res.status(404)
                            .json(err);
                    }
                    res.status(204)
                        .json(null);
                })
        } else {
            res.status(404)
                .json({ message: "Blog does not exist" });
        }
    });
}

module.exports = {
    blogFetchAll,
    blogFetchSome,
    blogReadOne,
    blogCreate,
    blogUpdateOne,
    blogDeleteOne
}
