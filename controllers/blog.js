const mongoose = require('mongoose');
const blog = mongoose.model("Blog");

const blogFetchAll = (req, res) => {
    blog.find()
        .exec((err, blogs) => {
            if (!blogs) {
                return res.status(404)
                    .json({
                        "message": "no blogs"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(blogs);
        });
}

const blogCreate = (req, res) => {
    blog.create({
        author: req.body.author,
        title: req.body.title,
        desc: req.body.desc,
    }, (err, blog) => {
        if (err) {
            res.status(400)
                .json(err);
        } else {
            res.status(201)
                .json(blog);
        }
    });
}

module.exports = {
    blogFetchAll,
    blogCreate
}
