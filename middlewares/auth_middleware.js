const jwt = require('jsonwebtoken');
const { Users } = require('../models');

module.exports = (req, res, next) => {

  console.log('auth 미들웨어 진입')
  const  {authorization}  = req.headers;
  const [tokenType, tokenValue] = authorization.split(' ');
  console.log(authorization);

  
  if (!tokenValue) {
    console.log('first IF')
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.',
    });
    return;
  }

  //토큰 검증
  try {
    console.log('try 진입');
    const {userId} = jwt.verify(tokenValue, process.env.SECRET_KEY);
    console.log(userId)
    //async 함수가 아니므로 await 사용못함 .then활용!
    Users.findOne({ where: { userId: userId } })
    .then((user) => {
      //locals는 마음대로 쓸 수 있는 저장공간

      res.locals.user = user

      next();
    });
  } catch (error) {
    console.log(error)
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.',
    });
    return;
  }
};
