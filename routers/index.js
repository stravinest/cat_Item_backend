const express = require('express');
const router = express.Router();

// const router_users = require("./router_users");
const router_posts = require('./router_posts.js');
// const router_comments = require("./router_comments");
const router_register = require("./router_register");
const router_login = require("./router_login");

// router.use("/users", router_users);
router.use('/posts', router_posts);
// router.use("/comments", router_comments);
// router.use("/sign", router_sign);
// router.use("/login", router_login);

router.use('/register', router_register)
router.use('/login', router_login)

// const routers_register = require('./routers/'); // 통신을 수행하는 Router 생성
// const routers_login = require('./routers/router_login'); // 통신을 수행하는 Router 생성

module.exports = router;
