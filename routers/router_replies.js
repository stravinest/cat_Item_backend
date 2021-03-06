const express = require('express');
const { Posts, Replies, sequelize, Sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth_middleware');

const router = express.Router();

//댓글 조회
router.get('/', async (req, res) => {
  let result = [];
  const { postId } = req.body;

  let preValCheck = await Replies.findOne({ where: { postId } });

  if (preValCheck) {
    try {
      const userId_join = `
              SELECT r.replyId, r.postId, r.userId, r.replyContent, u.nickname, r.createdAt, r.updatedAt
              FROM Replies AS r
              JOIN Users AS u
              ON r.userId = u.userId
              WHERE r.postId = ${postId} and r.replyDelType = 0
              ORDER BY r.replyId DESC`;
  
      const replies = await sequelize.query(userId_join, {
        type: Sequelize.QueryTypes.SELECT,
      });
  
      console.log({ replies });
      res.send({ result: replies });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send();
    }
  }else{
    res.status(400).send({ errorMessage: '해당 포스팅이 존재하지 않습니다.' });

  }
  
});

//댓글 등록
//param 말고 body data로 가져오도록. 상세페이지에서 등록하고 상세 조회 시 url에 postId 입력되어있으므로.
router.post(
  '/post',
  authMiddleware,
  async (req, res) => {
    let {userId} = res.locals.user;
    const { replyContent, postId } = req.body;
    // console.log('----------댓글등록 테스트 userId---------')
    // console.log(userId)
    // console.log('----------댓글등록 테스트 replyContent---------')
    // console.log(replyContent)

    //없는 포스팅을 대상으로 호출하는 경우 체크로직
    let preValCheck = await Posts.findOne({ where: { postId } });
    console.log('----------댓글등록 테스트 postInfo---------')
    console.log(postInfo)

    if (preValCheck) {
      try {
        await Replies.create({ userId, postId, replyContent });
        res.status(200).send({ result: '댓글 작성 완료!' });
      } catch (error) {
        console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
        res.status(400).send({ errorMessage: '댓글 작성에 실패하였습니다.' });
      }
    }else{

      res.status(400).send({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }

});

//댓글 삭제
router.patch('/delete', authMiddleware, async (req, res) => {
  let { userId } = res.locals.user;
  const { postId, replyId } = req.body;

  //없는 댓글 또는 포스팅을 대상으로 호출하는 경우 체크로직
  let preValCheck = await Replies.findOne({
    where: { userId, postId, replyId },
  });

  if (preValCheck) {
    try {
      await Replies.update(
        {
          replyDelType: 1,
        },
        {
          where: { postId: postId, userId: userId, replyId: replyId },
        }
      );

      res.status(200).send({ result: '댓글 삭제 완료!' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({ errorMessage: '댓글을 삭제할 수 없습니다.' });
    }
  } else {
    res.status(400).send({ errorMessage: '해당 댓글이 존재하지 않습니다.' });
  }
});

//댓글 수정
router.put('/modify', authMiddleware, async (req, res) => {
  let { userId } = res.locals.user;
  const { postId, replyId, replyContent } = req.body;

  //없는 댓글 또는 포스팅을 대상으로 호출하는 경우 체크로직
  let preValCheck = await Replies.findOne({
    where: { userId, postId, replyId },
  });

  if (preValCheck) {
    try {
      await Replies.update(
        {
          replyContent: replyContent,
        },
        {
          where: { postId: postId, userId: userId, replyId: replyId },
        }
      );

      res.status(200).send({ result: '댓글 수정 완료!' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({ errorMessage: '댓글을 수정할 수 없습니다.' });
    }
  } else {
    res.status(400).send({ errorMessage: '해당 댓글이 존재하지 않습니다.' });
  }
});

module.exports = router;
