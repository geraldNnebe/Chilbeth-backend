const mongoose = require('mongoose');
const Picture = mongoose.model('Picture');
const path = require('path');

const downloadSmallImage = (req, res) => {
        let sortingHash = path.parse(req.params.imageid).name;
        // let name = path.parse(req.params.imageid).ext;
        Picture.findOne({ sortingHash: sortingHash }) // TODO filter and send only smallSize
                .exec((err, picture) => {
                        if (err) return next(err);
                        try {
                                res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600'); // One year cache
                                res.contentType(picture.contentType);
                                res.status(200).send(Buffer.from(picture.smallSize, 'base64'));
                        } catch ($e) {
                                res.status(404);
                        }
                });
}

const downloadBigImage = (req, res) => {
        let sortingHash = path.parse(req.params.imageid).name;
        // let name = path.parse(req.params.imageid).ext;
        Picture.findOne({ sortingHash: sortingHash }) // TODO filter and send only bigSize
                .exec((err, picture) => {
                        if (err) return next(err);
                        try {
                                res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600'); // One year cache
                                res.contentType(picture.contentType);
                                res.status(200).send(Buffer.from(picture.bigSize, 'base64'));
                        } catch ($e) {
                                res.status(404);
                        }
                });
}

module.exports = {
        downloadSmallImage,
        downloadBigImage
}