const { Users } = require('../models');
var express = require('express');
var router = express.Router();
const crypto = require('crypto');

//유효성체크 함수
//id 유효성 체크 -  알파벳 대소문자, 숫자만 사용가능, 최소 3자리 이상
const valCheckId = function (target_id) {
  const regex_id = /([a-z]|[A-Z]|[0-9]){3,}/g;
  const idCheckResult = target_id.match(regex_id);

  return idCheckResult == target_id;
};

//pw 유효성 체크 - 패스워드는 닉네임과 같은 내용이 포함될 수 없음, 최소 4자리 이상
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
router.post('/', async (req, res) => {
  try {
    let { userId, userPw, nickname } = req.body;

    if (!valCheckId(userId)) {
      res.status(400).send({
        errorMessage:
          '아이디는 알파벳 대소문자와 숫자만 사용할 수 있으며, 최소 3자리 이상이어야 합니다.',
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

    //salt값 같이 저장해야함. 없으면 로그인 시 비교불가
    await Users.create({
      userId: userId,
      userPw: userPw,
      nickname: nickname,
      salt: salt,
    });

    res.status(200).send({ msg: '회원가입 완료!' });

  } catch (error) {
    console.log(error);
    res.status(400).send({
      errorMessage: '알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.',
    });
  }
});

module.exports = router;
