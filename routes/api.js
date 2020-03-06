const express = require('express');
const router = express.Router();

// Middleware that validates the incoming JWT and then extracts the
// payload data and adds it to the req object for the controller to use
const expressJwt = require('express-jwt');
// When included, express-jwt exposes a function that can be passed an "options object",
// which you’ll use to send the secret and also to specify the name of the property you
// want to add to the req object to hold the payload

const ctrlBlogs = require('../controllers/blog');
const ctrlAuth = require('../controllers/auth');

// Initialize the router middleware (an authentication middleware in this case) (yes, routers can have middlewares)
const auth = expressJwt({ // The "options object" we talked about earlier
    secret: process.env.JWT_SECRET, // The environment variable we created
    userProperty: 'payload'
})

router.route('/blog')
    .get(ctrlBlogs.blogFetchAll)
    .post(auth, ctrlBlogs.blogCreate); // Note the auth middleware

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
