const mongoose = require('mongoose');
const User = mongoose.model('User');

/* From the JWT token just decoded from express-jwt, check if the supplied user is valid */
/* Note that this is different from passport which deals with username and passwords.
   This function can be used for operations like checking user priviledges
*/
const checkUser = (req, res, callback) => {
    if (req.payload && req.payload.email) {
        User.findOne({ email: req.payload.email })
            .exec((err, user) => {
                if (!user) {
                    return res.status(404)
                        .json({ "message": "User not found" });
                } else if (err) {
                    console.log(err);
                    return res.status(404)
                        .json(err);
                } else if (user.admin !== true) // Makes sure user has admin priviledges
                    return res.status(401)
                        .json({ "message": "Unauthorized operation" });
                callback(req, res, user);
            });
    } else {
        return res
            .status(404)
            .json({ "message": "User not found" });
    }
}

module.exports = {
    checkUser
}
