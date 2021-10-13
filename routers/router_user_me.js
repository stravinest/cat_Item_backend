const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth_middleware');
//const cors = require("cors");
// router.use(cors())
router.get('/me', authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    userId: user.userId,
    nickname: user.nickname,
  });
});

module.exports = router;
