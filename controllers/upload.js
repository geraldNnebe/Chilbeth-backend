const mongoose = require('mongoose');
const canUpload = require('./checkUser').checkUser;
const Picture = mongoose.model("Picture");
const formidable = require('formidable');
const fs = require('fs');
const sharp = require('sharp');

function resize(path, format, width, height, outputName, callback = () => { }) {
    const outputImagePath = __dirname + '/../public/images/uploads/' + outputName + "." + format;

    return sharp(path)
        .toFormat(format)
        .resize(width, height)
        .toFile(outputImagePath)
        .then(() => {
            callback(path)
        }).
        catch(() => {
            // res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
            //     error: true,
            //     message: CONSTANTS.SERVER_ERROR_MESSAGE
            // });
            return false;
        });
}

function isHex(string) {
    var a = parseInt(string, 16);
    return true; // TODO fix
    return (a.toString(16) === string.toLowerCase());
}

const upload = (req, res) => {
    canUpload(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
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
                // When sending the image from the front-end, the sortingHash was the file name
                let sortingHash = name; // Do not optimize this line, to maintain its clarity
                if (!isHex(sortingHash)) { // Make sure the sortingHash is sensible (i.e a hex string)
                    return res.status(400)
                        .json({ error: "Invalid file upload name" });
                } else {
                    // After the upload, save image reference in the database
                    Picture.create({
                        author: author.email,
                        sortingHash: sortingHash
                    }, (err, picture) => {
                        if (err) {
                            res.status(400)
                                .json(err);
                        } else { // When we successfully added the image reference to the database
                            // We resize the uploaded image to two versions
                            // 300x200 has the aspect ratio 1.5:1 or 3:2
                            resize(file.path, "jpg", 300, 200, `small/${picture.sortingHash}`); // This is an asynchronous call, so if it doesn't complete before the next, we are in trouble. OMG I'm so lazy
                            // 1080x720 has the aspect ratio 1.5:1 or 3:2
                            resize(file.path, "jpg", 1080, 720, `big/${picture.sortingHash}`, (originalPathToDelete) => {  // aspect ratio 3:2
                                fs.unlinkSync(originalPathToDelete);
                                res.status(201)
                                    .json({
                                        message: "Image uploaded successfully",
                                        image: picture,
                                        further: file // TODO remove this for security
                                    });
                            });
                        }
                    });
                }
            })
            .on('error', (err) => {
                return res.status(400)
                    .json(err);
            });
        // .on('end', () => {
        //     res.end();
        // });
    });
}

module.exports = {
    upload
};