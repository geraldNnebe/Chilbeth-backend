const mongoose = require('mongoose');
const canAccess = require('../controllers/checkUser').checkUser;
const User = mongoose.model("User");

const getName = (email) => {
    User.findOne({ email: email }, (err, user) => {
        if (!user) {
            return 'Unknown';
        } else if (err) {
            return 'Unknown';
        }
        return user.name;
    });
}

// Be sure to show the details returned here, only to authorized users
const getDetails = (email) => {
    User.findOne({ email: email }, (err, user) => {
        if (!user) {
            throw new Exception('User does not exist');
        } else if (err) {
            throw new Exception('Error fetching user: ' + err);
        }
        return user;
    });
};

// Similar to getDetails, but can be called through Api
const fetchDetails = function (req, res) {
    canAccess(req, res, (req, res, requestingUser) => { // If JWT was decrypted, and is valid
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                return res.status(404) // The return statement here stops every other thing from running in the function, after res.status().json() has finished executing
                    .json({
                        "message": "no user found"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(user);
        });
    });
};

module.exports = {
    getName,
    getDetails,
    fetchDetails
}
