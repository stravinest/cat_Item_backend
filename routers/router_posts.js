const express = require('express');
const fs = require('fs');
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
            WHERE p.postDelType = 0
            ORDER BY p.postId DESC`;

    const posts = await sequelize.query(userId_join, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log({ posts });
    res.send({ result: posts });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

//게시글 등록
router.post(
  '/post',
  //authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const userId = 'stravinest'; //로그인 정보에서 가져온다.
      const image = req.file.filename;
      const { title, content } = req.body;

      // const { userId } = res.locals.user;

      await Posts.create({ userId, title, content, image });
      res.status(200).send({ result: '게시글 작성에 성공하였습니다.' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
  }
);

//게시글 수정
router.put('/modify/:postId', upload.single('image'), async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = 'stravinest'; //로그인 정보에서 가져온다.
    const { title, content } = req.body;
    const postInfo = await Posts.findOne({ where: { postId } });
    console.log(postInfo.image);

    if (req.file != undefined) {
      fs.unlinkSync(`./uploads/${postInfo.image}`, (err) => {
        console.log(err);
        res.end(err);
      }); //파일도 삭제해야댐
      const image = req.file.filename;
      await Posts.update(
        {
          title: title,
          content: content,
          image: image,
        },
        {
          where: { postId: postId },
        }
      );
    } else {
      await Posts.update(
        {
          title: title,
          content: content,
        },
        {
          where: { postId: postId },
        }
      );
    }

    res.send({ result: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

//게시글 삭제
router.patch('/delete/:postId', async (req, res) => {
  try {
    console.log('여기');
    const postId = req.params.postId;
    const postInfo = await Posts.findOne({ where: { postId } });
    console.log(postInfo.image);
    fs.unlinkSync(`./uploads/${postInfo.image}`, (err) => {
      //동기로 처리안하면 에러나는데 .. 흠 어떻게 해야할까?

      console.log(err);
      res.end(err);
    }); //파일도 삭제해야댐
    console.log('삭제?');
    await Posts.update(
      {
        postDelType: 1,
      },
      {
        where: { postId: postId },
      }
    );
    res.send({ result: '게시글을 삭제하였습니다.' });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

module.exports = router;
