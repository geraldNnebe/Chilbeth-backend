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
const ctrlDownload = require('../controllers/downloadImage');


// Initialize the router middleware (an authentication middleware in this case) (yes, routers can carry middlewares)
const expressJwt = expressjwt({ // The "options object" we talked about earlier
    secret: process.env.JWT_SECRET, // The environment variable we created
    userProperty: 'payload' // The name of the property you want to add to the req object to hold the payload
})

/* Blog routes */
router.route('/blog')
    .get(ctrlBlogs.blogFetchAll) // TODO Caution: payload size may be too much
    .post(expressJwt, ctrlBlogs.blogCreate); // Note the expressJwt router middleware
router.route('/blog/p/:page')
    .get(ctrlBlogs.blogFetchSome);
router.get('/blog/recent', ctrlBlogs.blogFetchRecent);
router.route('/blog/:blogid')
    .get(ctrlBlogs.blogReadOne)
    .put(expressJwt, ctrlBlogs.blogUpdateOne)
    .delete(expressJwt, ctrlBlogs.blogDeleteOne);
// Blog comments
router.route('/blog/:blogid/comment')
    .post(ctrlBlogs.addComment);
// router.delete('/blog/:blogid/comment/:commentid', ctrlBlogs.deleteComment);
router.route('/blog/:blogid/comment/:page')
    .get(ctrlBlogs.fetchComments);

/* Work routes */
router.route('/work')
    .get(ctrlWorks.workFetchAll) // TODO Caution: payload size may be too much
    .post(expressJwt, ctrlWorks.workCreate); // Note the expressJwt router middleware
router.route('/work/p/:page')
    .get(ctrlWorks.workFetchSome);
router.route('/work/:workid')
    .get(ctrlWorks.workReadOne)
    .put(expressJwt, ctrlWorks.workUpdateOne)
    .delete(expressJwt, ctrlWorks.workDeleteOne);

/* Admin settings route */
// router.route('/settings')
//     .post(expressJwt, adminSettings.updateSettings);

/* User authentication */
// User authentication doesn't make use of expressJwt above
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

/* Image upload and download */
router.route('/upload') // TODO enable auth middleware
    .post(expressJwt, ctrlUpload.upload);
router.get('/images/small/:imageid', ctrlDownload.downloadSmallImage);
router.get('/images/big/:imageid', ctrlDownload.downloadBigImage);


module.exports = router;
