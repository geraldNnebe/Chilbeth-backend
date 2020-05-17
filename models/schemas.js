const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: String,
    comment: String,
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const blogSchema = new mongoose.Schema({
    authorEmail: {
        type: String,
        required: true,
        default: process.env.DEFAULT_AUTHOR
    },
    title: {
        type: String,
        required: true
    },
    post: String,
    desc: String,
    imageSortHash: {
        type: String,
        default: "default.jpg" // TODO
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    comments: [blogCommentSchema]
});

const workSchema = new mongoose.Schema({
    authorEmail: {
        type: String,
        required: true,
        default: process.env.DEFAULT_AUTHOR
    },
    title: {
        type: String,
        required: true
    },
    imageSortHash: {
        type: String,
        required: true,
        default: "default.jpg" // TODO
    },
    desc: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    comments: [blogCommentSchema]
});

const pictureSchema = new mongoose.Schema({
    authorEmail: {
        type: String,
        required: true,
        default: process.env.DEFAULT_AUTHOR
    },
    sortingHash: {
        type: String,
        required: true,
        unique: true
    },
    smallSize: {
        type: String
    },
    bigSize: {
        type: String
    },
    contentType: {
        type: String,
        default: 'image/jpeg'
    }
});

const siteSettingSchema = new mongoose.Schema({ // There is only one (1) ever record in this collection
    static: {
        type: Number,
        unique: true,
        default: 1
    },
    landingImageOne: String,
    landingImageTwo: String,
    landingImageThree: String,
    profilePicture: String,
    profileThumbnail: String
});

mongoose.model("Blog", blogSchema);
mongoose.model("Work", workSchema);
mongoose.model("Picture", pictureSchema);
mongoose.model("Setting", siteSettingSchema);
