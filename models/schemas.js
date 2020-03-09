const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    comment: String
});

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
        default: process.env.DEFAULT_AUTHOR
    },
    title: {
        type: String,
        required: true
    },
    desc: String,
    post: String,
    image: {
        type: String,
        default: "default.jpg"
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    comments: [blogCommentSchema]
});

const workSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
        default: process.env.DEFAULT_AUTHOR
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: "default.jpg"
    },
    desc: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    comments: [blogCommentSchema]
})

mongoose.model("Blog", blogSchema);
mongoose.model("Work", workSchema);
