const mongoose = require('mongoose');
const canAccess = require('./checkUser').checkUser; // Used for checking user priviledges
const Settings = mongoose.model('Setting');
const deleteImageFromDB = require('./upload').deleteFromDatabase;

const readSettings = (req, res) => {
    Settings.findOne({ static: 1 }, (err, settings) => {
        if (err) {
            return res.status(500).json(err);
        } else if (!settings) {
            return res.status(500).json({ message: "Problem while retrieving site settings" });;
        }
        res.status(200)
            .json(settings);
    });
}

const saveSettings = function (req, res) {
    canAccess(req, res, (req, res, author) => { // Can I access what is below?
        try { // Try..catch block to supress all TypeError, or errors of undefined references, cause we'll be getting a lot here

            Settings.findOne({ static: 1 }, (err, settings) => {
                if (err) return res.status(500).json(err);
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
                    if (req.body.landingImageOne !== '')
                        settings.landingImageOne = req.body.landingImageOne;
                    if (req.body.landingImageTwo !== '')
                        settings.landingImageTwo = req.body.landingImageTwo;
                    if (req.body.landingImageThree !== '')
                        settings.landingImageThree = req.body.landingImageThree;
                    // TODO add other records here
                    settings.save((err, updatedSettings) => {
                        if (err) res.status(500).json(err);
                        else {
                            // Delete old image that is stored in mongodb
                            deleteImageFromDB(req.body.previousImageForDeletion);
                            res.status(200).json(updatedSettings);
                        }
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