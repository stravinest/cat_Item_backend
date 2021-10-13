var express = require('express');
var router = express.Router();

//프론트 연결 후 테스트 필요
router.post('/', async (req, res) => {
  try {
    console.log('logout 진입');
    const token = req.cookies.token;
    console.log(token);

    res.status(200).clearCookie(token);
    
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      code: 500,
      errorMessage: '서버 에러 발생',
    });
  }
});

module.exports = router;
