const express = require('express');
const router = express.Router();
const { Posts, sequelize, Sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth_middleware');
// const fs = require('fs');
const multer = require('multer');
const multerS3 = require('multer-s3');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const path = require('path');
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'stravinestbucket',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
    acl: 'public-read-write',
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

router.post('/upload', upload.single('image'), function (req, res) {
  const originalUrl = req.file.location;
  console.log(req.body);
  const { title, content } = req.body;
  const url = originalUrl.replace(/\/original\//, '/thumb/');
  console.log(title, content);
  console.log(originalUrl);
  console.log(url);
  res.json({ url, originalUrl });
});

//게시글 등록
router.post(
  '/post',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const { title, content } = req.body;
      if (req.file) {
        const originalUrl = req.file.location;
        console.log(req.file.filename);
        const resizeUrl = originalUrl.replace(/\/original\//, '/thumb/');
        const arr = resizeUrl.split('/');
        console.log('arr는', arr[5]);
        console.log(resizeUrl);
        await Posts.create({ userId, title, content, image: originalUrl });

        res.status(200).send({ result: '게시글 작성에 성공하였습니다.' });
        // res.json({ resizeUrl, originalUrl });
      } else {
        console.log('이미지 파일이 없습니다.');
        res.status(400).send({ errorMessage: '이미지파일이 없습니다.' });
      }
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(401).send({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
  }
);

//게시글 수정
router.put(
  '/modify/:postId',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const s3 = new AWS.S3();
      const postId = req.params.postId;
      const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const { title, content } = req.body;
      if (req.file) {
        //이미지가 있을때 기존 이미지를 s3에서 삭제해야됨
        const postInfo = await Posts.findOne({ where: { postId, userId } });
        console.log(postInfo.image);
        const beforeImage = postInfo.image.split('/')[4]; //이미지 주소 분리

        await s3.deleteObject(
          //original기존 파일 삭제
          {
            Bucket: 'stravinestbucket',
            Key: `original/${beforeImage}`,
          },
          (err, data) => {
            if (err) {
              throw err;
            }
            console.log('s3 deleteObject', data);
          }
        );
        await s3.deleteObject(
          //thumb기존 파일 삭제
          {
            Bucket: 'stravinestbucket',
            Key: `thumb/${beforeImage}`,
          },
          (err, data) => {
            if (err) {
              throw err;
            }
            console.log('s3 thumb deleteObject', data);
          }
        );

        const originalUrl = req.file.location; // 새로 교최된 이미지 url
        //   const resizeUrl = originalUrl.replace(/\/original\//, '/thumb/');

        if (postInfo) {
          await Posts.update(
            {
              title: title,
              content: content,
              image: originalUrl, //이미지 새로 교체해서 넣어줌
            },
            {
              where: { postId: postId, userId: userId },
            }
          );
          res.send({ result: '게시글을 수정하였습니다.' });
        } else res.send({ result: '게시글 수정 실패 되었습니다.' });
      } else {
        //이미지가 없을때
        const postInfo = await Posts.findOne({ where: { postId, userId } });
        if (postInfo) {
          await Posts.update(
            {
              title: title,
              content: content,
            },
            {
              where: { postId: postId, userId: userId },
            }
          );
          res.send({ result: '게시글을 수정하였습니다.' });
        } else res.send({ result: '게시글 수정 실패 되었습니다.' });
      }
      //
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

    // const s3 = new AWS.S3();
    // const beforeImage = postInfo.image.split('/')[4]; //이미지 주소 분리
    if (postInfo) {
      // s3.deleteObject(
      //   //기존 파일 삭제
      //   {
      //     Bucket: 'stravinestbucket',
      //     Key: `original/${beforeImage}`,
      //   },
      //   (err, data) => {
      //     if (err) {
      //       throw err;
      //     }
      //     console.log('s3 deleteObject', data);
      //   }
      // );

      await Posts.update(
        //deltype 숫자 수정
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
