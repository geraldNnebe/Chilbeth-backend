const mongoose = require('mongoose');
const canAccess = require('./checkUser').checkUser; // Used for checking user priviledges
const Settings = mongoose.model('Work');

const readSettings = (req, res) => {
    Work.findById(req.params.workid)
        .exec((err, work) => {
            if (!work) {
                return res.status(404)
                    .json({ "message": "no Work" });
            } else if (err) {
                return res.status(404)
                    .json(err);
            }
            res.status(200)
                .json(work);
        });
}

const saveSettings = function (req, res) {
    canAccess(req, res, (req, res, author) => { // Can I access what is below?
        try { // Try..catch block to supress all TypeError, or errors of undefined references, cause we'll be getting a lot here

            Settings.findOne({ static: 1 }, (err, settings) => {
                if (err) res.status(500).json(err);
                if (!settings) { // If no settings record has been created. Note that there is only ever one setting record, and it has a field 'static' whose value is 1
                    Settings.create({ // Create a record
                        static: 1,
                        landingImageOne: req.body.landingImageOne,
                        landingImageTwo: req.body.landingImageTwo,
                        landingImageThree: req.body.landingImageThree
                        // TODO add other records here
                    }, (err, newRecord) => {
                        if (err) res.status(500).json(err);
                        else {
                            res.status(200)
                                .json(newRecord);
                        }
                    });
                } else {
                    settings.landingImageOne = req.body.landingImageOne;
                    settings.landingImageTwo = req.body.landingImageTwo;
                    settings.landingImageThree = req.body.landingImageThree;
                    // TODO add other records here
                    settings.save((err, updatedSettings) => {
                        if (err) res.status(500).json(err);
                        else res.status(200).json(updatedSettings);
                    });
                }
            });

        } catch ($e) {
            if (!($e instanceof TypeError)) throw $e;
        }
    });
};

module.exports = {
    saveSettings,
    readSettings
}