const express = require('express');
const { Posts, Replies, sequelize, Sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth_middleware');

const router = express.Router();

//댓글 뿌리기 필요한지??
//(10.12. / 주혁 / status : 코드수정 안했음 - 정상 response 출력 확인)
// router.get('/', async (req, res) => {
router.get('/', async (req, res) => {
  try {
    const userId_join = `
            SELECT p.postId, p.userId, p.title, p.content, p.image, u.nickname, p.createdAt, p.updatedAt
            FROM Posts AS p
            JOIN Users AS u
            ON p.userId = u.userId
            WHERE p.replyDelType = 0
            ORDER BY p.postId DESC`;

    const posts = await sequelize.query(userId_join, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log({ posts });
    res.send({ result: posts });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

//댓글 등록
//(10.12. / 주혁 / status : db에 정상 적용 및 메세지 response 확인)
//param 말고 body data로 가져오는게 나을 듯. 상세페이지에서 등록하고 상세 조회 시 url에 postId 입력되어있으므로.
//(10.13./ 은규 / 다른포스트 즉 다른 게시물에 댓글등록 이 안됨 )

router.post('/post', authMiddleware, async (req, res) => {
  let { userId } = res.locals.user;
  const { replyContent, postId } = req.body;
  // console.log('----------댓글등록 테스트 userId---------')
  // console.log(userId)
  // console.log('----------댓글등록 테스트 replyContent---------')
  // console.log(replyContent)

  // //없는 포스팅을 대상으로 호출하는 경우 체크로직
  // let postInfo = await Posts.findOne({ where: { userId, postId } });
  let postInfo = await Posts.findOne({ where: { postId } });
  console.log('----------댓글등록 테스트 postInfo---------');
  console.log(postInfo);

  if (postInfo) {
    try {
      await Replies.create({ userId, postId, replyContent });
      res.status(200).send({ result: '댓글 작성 완료!' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }
  } else {
    res.status(400).send({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

//댓글 삭제
//(10.12. / 주혁 / status : db에 정상 적용 및 메세지 response 확인)
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
//(10.12. / 주혁 / status : db에 정상 적용 및 메세지 response 확인)
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
