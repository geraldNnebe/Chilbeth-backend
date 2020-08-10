const mongoose = require('mongoose');
const canAccess = require('./check-user').checkUser;
const getUser = require('../controllers/user');
const auth = require('./auth');

const changePassword = function (req, res) {
    canAccess(req, res, (req, res, author) => { // If JWT was decrypted, and is valid
        if (!author.validPassword(req.body.oldPassword))
            res.status(401)
                .json({ "message": "incorrect credentials" });
        else if (req.body.newPassword === req.body.retypePassword) {
            author.setPassword(req.body.newPassword);
            author.save((err) => {
                if (err) {
                    res.status(404)
                        .json(err);
                } else {
                    const token = author.generateJwt();
                    res.status(200)
                        .json({ token });
                }
            });
        } else {
            res.status(401)
                .json({ "message": "password mismatch" });
        }
    });
};

module.exports = {
    changePassword
};