const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Picture = mongoose.model('Picture');
const stream = require('stream');

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
        if (sortingHash == 'undefined') // At times, a variable may produce the string 'undefined'
                return getBlankImage(req, res);
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

const getBlankImage = (req, res) => { // TODO the blank image is not caching properly
        const resource = fs.createReadStream(__dirname + '/../public/images/blank.jpg');
        const ps = new stream.PassThrough();
        stream.pipeline(resource, ps, (err) => {
                if (err) {
                        console.log(err);
                        return res.status(404);
                }
        });
        res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600'); // One year cache
        res.contentType('image/jpeg');
        ps.pipe(res);
}

module.exports = {
        downloadSmallImage,
        downloadBigImage,
        getBlankImage
}