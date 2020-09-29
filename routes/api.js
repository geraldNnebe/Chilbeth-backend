const express = require('express');
const router = express.Router();

// Middleware that validates the incoming JWT and then extracts the
// payload data and adds it to the req object for the controller to use
const expressjwt = require('express-jwt');
// When included, express-jwt exposes a function that can be passed an "options object",
// which you’ll use to send the secret and also to specify the name of the property you
// want to add to the req object to hold the payload

const ctrlBlog = require('../controllers/blog');
const ctrlWork = require('../controllers/work');
const ctrlExhibition = require('../controllers/exhibition');
const ctrlAuth = require('../controllers/auth');
const ctrlPwd = require('../controllers/change-password');
const ctrlUpload = require('../controllers/upload');
const ctrlDownload = require('../controllers/download');
const ctrlNewsletter = require('../controllers/newsletter');
const adminSettings = require('../controllers/site-settings');

// Initialize the router middleware (an authentication middleware in this case) (yes, routers can carry middlewares)
const expressJwt = expressjwt({ // The "options object" we talked about earlier
    secret: process.env.JWT_SECRET, // The environment variable we created
    userProperty: 'payload' // The name of the property you want to add to the req object to hold the payload
})

/* Blog routes */
router.route('/blog')
    .get(ctrlBlog.blogFetchAll) // TODO Caution: payload size may be too much
    .post(expressJwt, ctrlBlog.blogCreate); // Note the expressJwt router middleware
router.route('/blog/p/:page')
    .get(ctrlBlog.blogFetchSome);
router.get('/blog/search', ctrlBlog.blogSearch);
router.get('/blog/recent', ctrlBlog.blogFetchRecent);
router.route('/blog/:blogid')
    .get(ctrlBlog.blogReadOne)
    .put(expressJwt, ctrlBlog.blogUpdateOne)
    .delete(expressJwt, ctrlBlog.blogDeleteOne);
// Blog comments
router.route('/blog/:blogid/comment')
    .post(ctrlBlog.addComment);
router.route('/blog/:blogid/comment/:commentid')
    .delete(expressJwt, ctrlBlog.deleteComment);
router.route('/blog/:blogid/comment/:page') // :page for page number when paging
    .get(ctrlBlog.fetchComments);

/* Work routes */
router.route('/work_categories')
    .get(ctrlWork.workCategoryFetchAll)
    .post(expressJwt, ctrlWork.workCategoryCreate);
router.route('/work_categories/:categoryid')
    .put(expressJwt, ctrlWork.workCategoryUpdate)
    .delete(expressJwt, ctrlWork.workCategoryDelete);
router.route('/work/:categoryid')
    .post(expressJwt, ctrlWork.workCreate); // Note the expressJwt router middleware
router.route('/work/p/:page') // Fetch work in the "featured list"
    .get(ctrlWork.workFetchSome);
router.route('/work/:categoryid/p/:page') // Fetch work in a category
    .get(ctrlWork.workFetchSomeByCategory);
router.route('/work/:workid')
    .get(ctrlWork.workReadOne)
    .put(expressJwt, ctrlWork.workUpdateOne)
    .delete(expressJwt, ctrlWork.workDeleteOne);

/* Exhibition routes */
router.route('/exhibition')
    .post(expressJwt, ctrlExhibition.exhibitionCreate);
router.route('/exhibition/p/:page')
    .get(ctrlExhibition.exhibitionFetchSome);
router.route('/exhibition/:exhibitionid')
    .get(ctrlExhibition.exhibitionReadOne)
    .put(expressJwt, ctrlExhibition.exhibitionUpdateOne)
    .delete(expressJwt, ctrlExhibition.exhibitionDeleteOne);

/* Newsletter routes */
router.route('/newsletter')
    .get(expressJwt, ctrlNewsletter.contactFetchAll)
    .post(ctrlNewsletter.contactCreate);

/* Admin settings route */
router.route('/settings')
    .get(adminSettings.readSettings)
    .put(expressJwt, adminSettings.saveSettings);

/* User authentication */
// User authentication doesn't make use of expressJwt above
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.route('/change_password').put(expressJwt, ctrlPwd.changePassword);

/* Image upload */
router.route('/upload')
    .post(expressJwt, ctrlUpload.upload);
router.route('/upload/and_delete_too')
    .post(expressJwt, ctrlUpload.uploadAndDelete);
router.route('/upload_landing_image')
    .post(expressJwt, ctrlUpload.uploadLandingImage);
router.route('/upload_site_logo')
    .post(expressJwt, ctrlUpload.uploadSiteLogo);
router.route('/upload_artwork')
    .post(expressJwt, ctrlUpload.uploadArtwork);
router.route('/upload_profile/:type')
    .post(expressJwt, ctrlUpload.uploadProfile);
/* Image download */
router.get('/images/small/:imageid', ctrlDownload.downloadSmallImage);
router.get('/images/big/:imageid', ctrlDownload.downloadBigImage);
router.get('/images/big/blank/:imageid', ctrlDownload.getBlankImage); // Serve the blank image if it's requested. :imageid in this case will be the string 'blank'
/* Download CV */
router.get('/cv/:sortinghash/cv.pdf', ctrlDownload.downloadCV);

module.exports = router;
