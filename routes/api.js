const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/blog');

router.route('/blog')
    .get(ctrlBlogs.blogFetchAll)
    .post(ctrlBlogs.blogCreate);

module.exports = router;
