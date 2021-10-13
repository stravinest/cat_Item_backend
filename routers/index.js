const express = require('express');
const router = express.Router();

const router_posts = require('./router_posts.js');

const router_register = require("./router_register");
const router_login = require("./router_login");
const router_logout = require("./router_logout");
const router_replies = require('./router_replies.js');


router.use('/posts', router_posts);
router.use('/replies', router_replies);
router.use('/register', router_register);
router.use('/login', router_login);
router.use('/logout', router_logout);

// const routers_register = require('./routers/'); // 통신을 수행하는 Router 생성
// const routers_login = require('./routers/router_login'); // 통신을 수행하는 Router 생성

module.exports = router;
