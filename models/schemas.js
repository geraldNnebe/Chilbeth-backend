const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    comment: String
})

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
        default: "Chilbeth"
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    comments: [blogCommentSchema]
})

mongoose.model("Blog", blogSchema);
