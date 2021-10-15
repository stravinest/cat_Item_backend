const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
//const authMiddleware = require('../middlewares/auth_middleware');
//const cors = require("cors");
// router.use(cors())
router.post('/me', async (req, res) => {
  const token = req.body.usertoken;
  console.log ("토큰 test")
  console.log(req.body)
  
  if (token) {
    console.log(token)
    const { userId } = jwt.verify(token, process.env.SECRET_KEY);
    res.send({
      userId: userId,
    });
  } else {
    res.status(400).send({
      errorMessage: '토큰값 실패.',
    });
  }
});

module.exports = router;
