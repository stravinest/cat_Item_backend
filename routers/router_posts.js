const express = require('express');
const { Posts, sequelize, Sequelize } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require("../middlewares/auth_middleware");

//upload폴더
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

//게시글 받아와서 뿌리기
router.get('/', authMiddleware,async (req, res) => {
  let result = [];
  try {
    const userId_join = `
            SELECT p.postId, p.userId, p.title, p.content, p.image, u.nickname, p.createdAt, p.updatedAt
            FROM Posts AS p
            JOIN Users AS u
            ON p.userId = u.userId
            ORDER BY p.postId DESC`;

    const posts = await sequelize.query(userId_join, {
      type: Sequelize.QueryTypes.SELECT,
    });
    for (const post of posts) {
      result.push({
        postId: post.postId,
        userId: post.userId,
        nickname: post.nickname,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      });
    }

    console.log({ posts });
    res.send({ result: posts });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

//게시글 등록
router.post('/post', upload.single('image'), async (req, res) => {
  try {
    const userId = 'stravinest'; //로그인 정보에서 가져온다.
    const image = req.file.filename;
    const { title, content } = req.body;
    let postDelType = 1;
    // const { userId } = res.locals.user;

    await Posts.create({ userId, title, content, image, postDelType });
    res.status(200).send({ result: '게시글 작성에 성공하였습니다.' });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

//게시글 수정
router.put('/:postId', upload.single('image'), async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = 'stravinest'; //로그인 정보에서 가져온다.
    const comment = req.body;
    console.log(id);
    console.log(comment);
    const result = await Posts.update(
      {
        comment: comment,
      },
      {
        where: { postId: postId },
      }
    );
    console.log(result);
    res.send({ result: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

module.exports = router;
