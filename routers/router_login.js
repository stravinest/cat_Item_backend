const { Users } = require('../models');
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  let { userId, userPw } = req.body;

  //userPw 해시화 후 재할당

  try {
    const users = await Users.findOne({ where: { userId } });
    let salt = users.salt;
    findUserPw = crypto
      .createHash('sha512')
      .update(userPw + salt)
      .digest('hex');

    if (!users || findUserPw != users.userPw) {
      res.status(400).send({
        errorMessage: '아이디 또는 패스워드가 잘못됐습니다.',
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: userId,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '20m',
      }
    );

    console.log('-----------token----------');
    console.log(token);

    res.cookie('token', token, {
      httpOnly: true,
    });

    res.send({
      code: 201,
      message: '로그인 완료',
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      code: 500,
      errorMessage: '서버 에러 발생',
    });
  }
});

module.exports = router;
