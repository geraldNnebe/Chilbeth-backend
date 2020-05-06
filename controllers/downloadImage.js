const mongoose = require('mongoose');
const Picture = mongoose.model('Picture');
const path = require('path');

const downloadSmallImage = (req, res) => {
        let sortingHash = path.parse(req.params.imageid).name;
        // let name = path.parse(req.params.imageid).ext;
        Picture.find({ sortingHash: sortingHash }) // TODO filter and send only smallSize
                .exec((err, picture) => {
                        if (err) return next(err);
                        res.status(200)
                                .json(picture);
                        // res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600'); // One year cache
                        // res.contentType(picture.smallSize.contentType);
                        // res.send(picture.smallSize.data);
                });
}

const downloadBigImage = (req, res) => {
        let sortingHash = path.parse(req.params.imageid).name;
        // let name = path.parse(req.params.imageid).ext;
        Picture.find({ sortingHash: sortingHash }) // TODO filter and send only big
                .exec((err, picture) => {
                        if (err) return next(err);
                        // res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600'); // One year cache
                        // res.contentType(picture.bigSize.contentType);
                        // res.send(picture.bigSize.data);
                });
}

module.exports = {
        downloadSmallImage,
        downloadBigImage
}