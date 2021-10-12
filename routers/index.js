const express = require('express');
const router = express.Router();

const router_posts = require('./router_posts.js');
const router_replies = require('./router_replies.js');

router.use('/posts', router_posts);
router.use('/replies', router_replies);

module.exports = router;
