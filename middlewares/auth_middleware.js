const jwt = require('jsonwebtoken');
const User = require('../models/users');

module.exports = (req, res, next) => {
  //헤더 제거 필요함 -> 세션스토리지말고 쿠키 활용방향으로 미들웨어 적용 필요함
  const authorization = req.cookies.token;

  if (!authorization) {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.',
    });
    return;
  }

  //토큰 검증
  try {
    const { userId } = jwt.verify(authorization, 'jasonblog-secret-key');

    //async 함수가 아니므로 await 사용못함 .then활용!
    User.findOne({ where: { userId: userId } }).then((user) => {
      //locals는 마음대로 쓸 수 있는 저장공간
      res.locals.user = user;
      next();
    });
  } catch (error) {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.',
    });
    return;
  }
};
