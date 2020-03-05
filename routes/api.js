const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/blog');
const ctrlAuth = require('../controllers/auth');

router.route('/blog')
    .get(ctrlBlogs.blogFetchAll)
    .post(ctrlBlogs.blogCreate);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
