const express = require('express');
// const usersRouter = require('./users');
const mainRouter = require('./main');
// const boardRouter = require('./board');
// const writeRouter = require('./write');
// const detailRouter = require('./detail');

const router = express.Router();

router.use('/', mainRouter); // ./main 실행
// router.use('/users', usersRouter); // ./users 실행
// router.use('/board', boardRouter);
// router.use('/write', writeRouter);
// router.use('/detail', detailRouter);

module.exports = router;
