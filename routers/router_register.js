const { Users } = require('../models');
var express = require('express');
var router = express.Router();
const crypto = require('crypto');

//유효성체크 함수
const valCheckId = function (target_nickname) {
  const regex_nick = /([a-z]|[A-Z]|[0-9]){3,}/g;
  const nicknameCheckResult = target_nickname.match(regex_nick);

  return nicknameCheckResult == target_nickname;
};

const valCheckPw = function (target_password, target_nickname) {
  if (
    target_nickname.indexOf(target_password) == -1 &&
    target_password.length >= 4
  ) {
    return true;
  }
  return false;
};

//회원가입
router.post('/register', async (req, res) => {
  let { userId, userPw, nickname } = req.body;
  // res.send({userId, userPw, nickname})

  try {
    if (!valCheckId(nickname)) {
      res.status(400).send({
        errorMessage:
          '닉네임은 알파벳 대소문자와 숫자만 사용할 수 있으며, 최소 3자리 이상이어야 합니다.',
      });
      return;
    }

    //패스워드 유효성 체크
    if (!valCheckPw(userPw, nickname)) {
      res.status(400).send({
        errorMessage:
          '패스워드는 닉네임과 같은 내용이 포함될 수 없으며, 최소 4자리 이상이어야 합니다.',
      });
      return;
    }

    //중복 아이디 여부 체크
    const existUserId = await Users.findOne({ where: { userId } });
    if (existUserId) {
      res.status(400).send({
        errorMessage: '이미 가입된 아이디가 있습니다.',
      });
      return;
    }

    // 중복 닉네임 여부 체크
    const existUserNickname = await Users.findOne({ where: { nickname } });
    if (existUserNickname) {
      res.status(400).send({
        errorMessage: '이미 가입된 닉네임이 있습니다.',
      });
      return;
    }

    console.log({ Users });
    const salt = crypto.randomBytes(128).toString('base64');
    userPw = crypto
      .createHash('sha512')
      .update(userPw + salt)
      .digest('hex');

    await Users.create({
      userId: userId,
      userPw: userPw,
      nickname: nickname,
      salt: salt,
    });

    res.status(201).send({ msg: '회원가입 라우터 status : 201' });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      errorMessage: '알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.',
    });
  }
});

module.exports = router;
