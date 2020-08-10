const mongoose = require('mongoose');
const Blog = mongoose.model("Blog");
const canAccess = require('./check-user').checkUser;
const getUser = require('../controllers/user');
const deleteImageFromDB = require('./upload').deleteFromDatabase;

const blogFetchAll = (req, res) => { // TODO should not fetch the post, since it will be too long
    Blog.find()
        .exec((err, blogs) => {
            if (!blogs) {
                // The return statement here stops every other thing from running in the function,
                // after res.status().json() has finished executing
                return res.status(404)
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

const blogFetchSome = (req, res) => { // TODO should not fetch the actual post, since it can be too long
    var perPage = 3;
    var currentPageNumber = +req.params.page > 0 ? +req.params.page : 1; // The + casts string to number
    Blog.find()
        .skip(perPage * (currentPageNumber - 1))
        .limit(perPage)
        .sort({ createdOn: 'desc' })
        .exec((err, blogs) => {
            if (!blogs) {
                // The return statement here stops every other thing from running in the function,
                // after res.status().json() has finished executing
                return res.status(404)
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

const blogSearch = (req, res) => {
    Blog.search(req.query.terms, (err, data) => {
        res.status(200)
            .json(data);
    })
}

const blogFetchRecent = (req, res) => {
    blogFetchSome(req, res, 4);
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
        // Make sure the new blog image was uploaded using the api route that calls uploadAndDelete().
        // No need of deleting the previous blog image, because it should have already been 
        // deleted if the front-end used the right route that calls uploadAndDelete()
        // If not, then we'll have a data leak
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
                blog.imageSortHash = req.body.sortingHash,
                    blog.save((err, blog) => {
                        if (err) {
                            res.status(404) // We didn't use return, so we'd have to use the else statement
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
                    // Delete uploaded image after deleting blog
                    deleteImageFromDB(blog.imageSortHash);
                    res.status(204)
                        .json(null);
                })
        } else {
            res.status(404)
                .json({ message: "Blog does not exist" });
        }
    });
}

const addCommentSubdocument = (req, res, blog) => {
    if (!blog)
        return res.status(404).json({ "message": "Blog not found" });

    // Add the comment
    blog.comments.push({
        name: req.body.name,
        email: req.body.email,
        comment: req.body.comment
    });
    // Save it
    blog.save((err, blog) => {
        if (err) {
            return res.status(400)
                .json(err);
        }
        //  Finds last comment in the returned array, since MongoDB returns the entire parent
        // document, not only the new subdocument
        let comment = blog.comments[blog.comments.length - 1];
        res.status(201)
            .json(comment);
    });
}

const addComment = (req, res) => {
    const blogId = req.params.blogid;
    if (blogId) {
        Blog.findById(blogId)
            .exec((err, blog) => {
                if (err)
                    return res.status(400)
                        .json(err);
                if (req.body.comment != '' && req.body.name != '') {
                    // Increment blog comment count
                    blog.commentCount = blog.commentCount + 1;
                    blog.save((err, blog) => { addCommentSubdocument(req, res, blog) });
                } else {
                    res
                        .status(400)
                        .json({ "message": "Comment not added" });
                }
            });
    } else {
        res
            .status(404)
            .json({ "message": "Blog not found" });
    }

}

const fetchComments = (req, res) => {
    var perPage = 3; // TODO paginate comments
    var currentPageNumber = +req.params.page > 0 ? +req.params.page : 1; // The + casts string to number
    Blog.findById(req.params.blogid)
        .select('comments')
        .exec((err, blog) => {
            if (!blog) {
                return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
                    .json({
                        "message": "Blog not found"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(blog.comments);
        });
}

const deleteComment = (req, res) => {
    canAccess(req, res, (req, res, author) => {
        const { blogid, commentid } = req.params;
        if (blogid) {
            Blog.findOne(blogid)
                .exec((err, blog) => {
                    if (!blog) {
                        return res
                            .status(404)
                            .json({ 'message': 'Blog not found' });
                    } else if (err) {
                        return res.status(404)
                            .json(err);
                    }
                    if (blog.comments && blog.comments.length > 0) {
                        if (!blog.comments.id(commentid)) {
                            return res
                                .status(404)
                                .json({ 'message': 'Comment not found' });
                        } else {
                            blog.comments.id(commentid).remove();
                            blog.commentCount = blog.commentCount - 1;
                            blog.save(err => {
                                if (err) {
                                    return res
                                        .status(404)
                                        .json(err);
                                } else {
                                    res.status(204)
                                        .json(null);
                                }
                            });
                        }
                    }
                });
        } else {
            res.status(404)
                .json({ message: "Blog does not exist" });
        }
    });
}

module.exports = {
    blogFetchAll,
    blogFetchSome,
    blogSearch,
    blogFetchRecent,
    blogReadOne,
    blogCreate,
    blogUpdateOne,
    blogDeleteOne,
    addComment,
    fetchComments,
    deleteComment
}
