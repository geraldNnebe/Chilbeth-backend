const mongoose = require('mongoose');
// const ifEnter = require('./checkUser').checkUser;
const Picture = mongoose.model("Picture");
const formidable = require('formidable');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto'); // TODO remove this

function resize(path, format, width, height, outputName, callback = () => { }) {
    const outputImagePath = __dirname + '/../public/images/uploads/' + outputName + "." + format;

    console.log(outputImagePath);
    return sharp(path)
        .toFormat(format)
        .resize(width, height)
        .toFile(outputImagePath)
        .then(() => {
            callback()
        }).
        catch(() => {
            // res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
            //     error: true,
            //     message: CONSTANTS.SERVER_ERROR_MESSAGE
            // });
            return false;
        });
}

const upload = (req, res) => {
    new formidable.IncomingForm().parse(req)
        .on('fileBegin', (name, file) => {
            file.path = __dirname + '/../public/images/uploads/' + file.name
        })
        // .on('field', (name, field) => {
        //     console.log('Field', name, field)
        // })
        // .on('file', (name, file) => {
        //     console.log('Uploaded file', name, file)
        // })
        // .on('aborted', () => {
        //     console.error('Request aborted by the user')
        // })
        // .on('error', (err) => {
        //     console.error('Error', err)
        //     throw err
        // })
        .on('file', (name, file) => {
            let imageHash = req.body.sortCode; // TODO sanitize the hash
            // After the upload, save image reference in the database
            Picture.create({
                author: "chinyere@gmail.com",
                // sortingHash: imageHash
                sortingHash: crypto.randomBytes(20).toString('hex') // TODO remove this and uncomment above
            }, (err, picture) => {
                if (err) {
                    res.status(400)
                        .json(err);
                } else { // When we successfully added the image reference to the database
                    // We resize the uploaded image to two versions
                    let main = resize(file.path, "png", 1080, 720, `big/${picture.sortingHash}`); // 1080x720 has the aspect ratio 1.5:1 or 3:2
                    let thumb = resize(file.path, "png", 300, 200, `small/${picture.sortingHash}`, () => {  // aspect ratio 3:2
                        fs.unlinkSync(file.path);
                        res.status(201)
                            .json({
                                message: "Image uploaded successfully",
                                image: picture,
                                further: file // TODO remove this for security
                            });
                    });
                }
            });
        })
        .on('error', (err) => {
            return res.status(400)
                .json(err);
        });
    // .on('end', () => {
    //     res.end();
    // });
}

module.exports = {
    upload
};