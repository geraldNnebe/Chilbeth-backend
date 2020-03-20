const express = require('express');
const router = express.Router();

// Middleware that validates the incoming JWT and then extracts the
// payload data and adds it to the req object for the controller to use
const expressjwt = require('express-jwt');
// When included, express-jwt exposes a function that can be passed an "options object",
// which you’ll use to send the secret and also to specify the name of the property you
// want to add to the req object to hold the payload

const ctrlBlogs = require('../controllers/blog');
const ctrlWorks = require('../controllers/work');
const ctrlAuth = require('../controllers/auth');
const ctrlUpload = require('../controllers/upload');

// Initialize the router middleware (an authentication middleware in this case) (yes, routers can have middlewares)
const expressJwt = expressjwt({ // The "options object" we talked about earlier
    secret: process.env.JWT_SECRET, // The environment variable we created
    userProperty: 'payload' // The name of the property you want to add to the req object to hold the payload
})

/* Blog routes */
router.route('/blog')
    .get(ctrlBlogs.blogFetchAll)
    .post(expressJwt, ctrlBlogs.blogCreate); // Note the expressJwt router middleware
router.route('/blog/:blogid')
    .get(ctrlBlogs.blogReadOne)
    .put(expressJwt, ctrlBlogs.blogUpdateOne)
    .delete(expressJwt, ctrlBlogs.blogDeleteOne);

/* Work routes */
router.route('/work')
    .get(ctrlWorks.workFetchAll)
    .post(expressJwt, ctrlWorks.workCreate); // Note the expressJwt router middleware
router.route('/work/:workid')
    .get(ctrlWorks.workReadOne)
    .put(expressJwt, ctrlWorks.workUpdateOne)
    .delete(expressJwt, ctrlWorks.workDeleteOne);

/* Admin settings route */
// router.route('/settings')
//     .post(expressJwt, adminSettings.updateSettings);

/* User authentication */
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

/* File upload */
router.route('/upload') // TODO enable auth middleware
    .post(expressJwt, ctrlUpload.upload);

module.exports = router;
