const express = require('express');
const router = express.Router();
//const authMiddleware = require('../middlewares/auth_middleware');
//const cors = require("cors");
// router.use(cors())
router.get('/me', async (req, res) => {
  const token = req.body.token;
  const { userId } = jwt.verify(token, process.env.SECRET_KEY);

  if (token) {
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
