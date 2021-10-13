const express = require('express');
const { Posts, sequelize, Sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth_middleware');

// multi part form data로 이미지파일을 받으려 했으나 이미지 url만 넘겨서 받기로 수정
// const fs = require('fs');
// const multer = require('multer');
// const path = require('path');

// //upload폴더
// try {
//   fs.readdirSync('uploads');
// } catch (error) {
//   console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
//   fs.mkdirSync('uploads');
// }
// const upload = multer({
//   storage: multer.diskStorage({
//     destination(req, file, cb) {
//       cb(null, 'uploads/');
//     },
//     filename(req, file, cb) {
//       const ext = path.extname(file.originalname);
//       cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

const router = express.Router();

//게시글 받아와서 뿌리기
router.get('/', async (req, res) => {
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
    res.send({ result: posts });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send({
      errorMessage: '전체 게시글 조회에 실패했습니다.',
    });
  }
});

//게시글 등록
router.post(
  '/post',
  authMiddleware,
  // upload.single('image'),
  async (req, res) => {
    try {
      const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      // const image = req.file.filename;
      const { title, content, image } = req.body;

      await Posts.create({ userId, title, content, image });
      res.status(200).send({ result: '게시글 작성에 성공하였습니다.' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
  }
);

//게시글 수정
router.put(
  '/modify/:postId',
  authMiddleware,
  // upload.single('image'),
  async (req, res) => {
    try {
      const postId = req.params.postId;
      const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const { title, content, image } = req.body;
      const postInfo = await Posts.findOne({ where: { postId, userId } });
      console.log(postInfo);
      if (postInfo) {
        await Posts.update(
          {
            title: title,
            content: content,
            image: image,
          },
          {
            where: { postId: postId, userId: userId },
          }
        );
        res.send({ result: '게시글을 수정하였습니다.' });
      }
      res.send({ result: '게시글 수정 실패 되었습니다.' });
      // if (req.file != undefined) {
      //   fs.unlinkSync(`./uploads/${postInfo.image}`, (err) => {
      //     console.log(err);
      //     res.end(err);
      //   }); //파일도 삭제해야댐
      //   const image = req.file.filename;
      //   await Posts.update(
      //     {
      //       title: title,
      //       content: content,
      //       image: image,
      //     },
      //     {
      //       where: { postId: postId },
      //     }
      //   );
      // } else {
      //   await Posts.update(
      //     {
      //       title: title,
      //       content: content,
      //     },
      //     {
      //       where: { postId: postId },
      //     }
      //   );
      // }
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({
        errorMessage: '게시글 수정에 실패했습니다.',
      });
    }
  }
);

//게시글 삭제
router.patch('/delete/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId } = res.locals.user; //로그인 정보에서 가져온다.
    const postInfo = await Posts.findOne({ where: { postId, userId } });
    // fs.unlinkSync(`./uploads/${postInfo.image}`, (err) => {
    //   //동기로 처리안하면 에러나는데 .. 흠 어떻게 해야할까?
    //   console.log(err);
    //   res.end(err);
    // }); //파일도 삭제해야댐
    if (postInfo) {
      console.log('여기되자나?');
      await Posts.update(
        {
          postDelType: 1,
        },
        {
          where: { postId: postInfo.postId, userId: postInfo.userId },
        }
      );
      // const postInfo2 = await Posts.findOne({ where: { postId, userId } });
      // console.log(postInfo2.postDelType);
      res.send({ result: '게시글을 삭제하였습니다.' });
    } else {
      res.status(400).send({
        errorMessage: '삭제할수 없는 게시물입니다.',
      });
    }
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send({
      errorMessage: '게시글 삭제에 실패했습니다.',
    });
  }
});

//-----단일 게시글 세부 조회 추가----- 세부 조회시에 댓글 내용도 같이 넘겨주는건?

router.get('/:postId', async (req, res) => {
  const postId = req.params.postId;
  //다른 router 스코프 내에서도 선언되야하므로 let 으로 선언
  let { userId } = res.locals.user;
  console.log('--------res.locals.user 출력 테스트---------');
  console.log(userId);
  try {
    // const postDetail = await Posts.findOne({ where: { postId, userId } });
    // //포스트아이디랑 userid 둘다 같아야 되서 내가 쓰지않은 글은 조회가 안됨
    const postDetail = await Posts.findOne({ where: { postId } });
    console.log('--------postDetail 출력 테스트---------');
    console.log({ postDetail });
    res.send({ result: postDetail });
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send();
  }
});

module.exports = router;
