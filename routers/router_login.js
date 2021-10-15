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

    if (!users) {
      res.status(400).send({
        errorMessage: '아이디 또는 패스워드가 잘못됐습니다.',
      });
    }

    //계정별 저장되어있는 salt값을 활용해서 해시화
    let salt = users.salt;
    findUserPw = crypto
      .createHash('sha512')
      .update(userPw + salt)
      .digest('hex');

    //해사화된 pw와 회원가입 시 해시화해서 저장한 pw와 비교
    if (findUserPw != users.userPw) {
      res.status(400).send({
        errorMessage: '아이디 또는 패스워드가 잘못됐습니다.',
      });
      return;
    }

    //jwt토큰 생성
    const token = jwt.sign(
      {
        userId: userId,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '2h',
      }
    );

    console.log('-----------token----------');
    console.log(token);

    //생성한 토큰을 쿠키에 담아서 response
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
      errorMessage: '알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.',
    });
  }
});

module.exports = router;
