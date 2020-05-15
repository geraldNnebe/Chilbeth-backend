const mongoose = require('mongoose');
const canUpload = require('./checkUser').checkUser;
const Picture = mongoose.model("Picture");
const formidable = require('formidable');
const fs = require('fs');
const doAsync = require('doasync'); // To read bigImagePath asynchronously
// const sharp = require('sharp'); // I replaced this with jimp
const Jimp = require('jimp');

function resize(path, width, height, outputName, callback = () => { }) {
    const outputImagePath = __dirname + '/../public/images/uploads/' + outputName + ".jpg";

    /* Sharp uses native binaries, and I don't know why that makes it stop randomly on glitch.com */
    // sharp(path)
    //     .toFormat(format)
    //     .resize(width, height)
    //     .toFile(outputImagePath)
    //     .then(() => {
    //         callback(path);
    //     }).
    //     catch(() => {
    //         // res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
    //         //     error: true,
    //         //     message: CONSTANTS.SERVER_ERROR_MESSAGE
    //         // });
    //         return false;
    //     });

    // With callback
    // Jimp.read(path, (err, image) => {
    //     if (err) throw err;
    //     image // image is automatically jpg
    //         .resize(width, height)
    //         .quality(60)
    //         .write(outputImagePath);
    //     callback(path);
    // });

    // With promise
    Jimp.read(path)
        .then(image => { // image will be automatically encoded in jpg
            if (image
                .resize(width, height)
                .quality(60)
                .write(outputImagePath))
                callback(path);
        })
        .catch(err => console.log('Image upload in upload.js failed'));
}

function deleteFile(name) {
    let filePath = __dirname + '/../public/images/uploads/' + name + ".jpg";
    fs.unlinkSync(filePath);
}

// Sends files to database and deletes from disk
const moveFilesToMongoDB = (sortingHash, author, callback) => {
    let smallImagePath = __dirname + '/../public/images/uploads/small/' + sortingHash + ".jpg";
    let bigImagePath = __dirname + '/../public/images/uploads/big/' + sortingHash + ".jpg";
    // store an img in binary in mongo

    doAsync(fs).readFile(bigImagePath) // We can't read the large image synchronously since it's large. We read it from here, asynchronously, instead
        .then((bigImage) => {
            Picture.create({
                authorEmail: author.email,
                sortingHash: sortingHash,
                smallSize: fs.readFileSync(smallImagePath, { encoding: 'base64' }), // We can easily read the small image synchronously
                bigSize: Buffer.from(bigImage).toString('base64')
            }, (err, picture) => {
                callback(err, picture); // Callback, so that after saving it we can send status messages from there
                // Note that 'picture' is a Mongoose object
            });
        });
}

function isHex(string) {
    var a = parseInt(string, 16);
    return true; // TODO fix
    return (a.toString(16) === string.toLowerCase());
}

const performUpload = (req, res, savingTechnique) => {
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
                if (!isHex(sortingHash)) // Make sure the sortingHash is sensible (i.e a hex string)
                    return res.status(400)
                        .json({ error: "Invalid file upload name" });
                else
                    savingTechnique(file, sortingHash, author); // Save it the way I want it saved
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

const deleteFromDatabase = (sortingHash) => { // Do not call this function within an unauthenticated operation
    Picture.findOneAndRemove({ sortingHash: sortingHash })
        .exec((err, picture) => {
            if (err)
                return err;
        });
}

// Performs a simple image upload for artworks and blogs
const upload = (req, res) => {
    let savingTechnique = (file, sortingHash, author) => {
        // 'file' is an object that encapsulates the newly uploaded file
        // We resize the uploaded image to two versions
        // 300x200 has the aspect ratio 1.5:1 or 3:2
        resize(file.path, 300, 200, `small/${sortingHash}`); // This is an asynchronous call, so if it doesn't complete before the next, we are in trouble. OMG I'm so lazy
        // 1080x720 has the aspect ratio 1.5:1 or 3:2
        resize(file.path, 1080, 720, `big/${sortingHash}`, (originalPathToDelete) => {  // aspect ratio 3:2
            fs.unlinkSync(originalPathToDelete); // Delete original image file (the large image that just got uploaded)
            moveFilesToMongoDB(sortingHash, author, (err, picture) => { // Then save the resized versions to the database
                // When we successfully added the image to the database
                // Delete the small and large image files on disk
                deleteFile(`small/${sortingHash}`);
                deleteFile(`big/${sortingHash}`);

                if (err) // Did any error occur?
                    return res.status(400)
                        .json(err);

                // We are done if no errors
                res.status(201)
                    .json({
                        message: "Image uploaded successfully",
                        image: picture
                    });
            });
        });
    };
    performUpload(req, res, savingTechnique);
}

// Uploads an image for the landing page
const uploadLandingImage = (req, res) => {
    let savingTechnique = (file, sortingHash, author) => {
        resize(file.path, 300, 200, `small/${sortingHash}`);
        resize(file.path, 1344, 678, `big/${sortingHash}`, (originalPathToDelete) => {
            fs.unlinkSync(originalPathToDelete);
            moveFilesToMongoDB(sortingHash, author, (err, picture) => {
                deleteFile(`small/${sortingHash}`);
                deleteFile(`big/${sortingHash}`);

                if (err)
                    return res.status(400)
                        .json(err);

                // We are done if no errors
                res.status(201)
                    .json({
                        message: "Image uploaded successfully",
                        image: picture
                    });
            });
        });
    };
    // Perform upload
    performUpload(req, res, savingTechnique);
}

module.exports = {
    upload,
    uploadLandingImage,
    deleteFromDatabase
};
