const formidable = require('formidable');

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
            res.status(201)
                .json(file); // TODO for security reasons, return file.name only, instead of file
        })
        .on('error', (err) => {
            return res.status(400)
                .json(err);
        })
        .on('end', () => {
            res.end();
        });
}

module.exports = {
    upload
};