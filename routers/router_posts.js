const express = require('express');
const router = express.Router();
const { Posts, sequelize, Sequelize } = require('../models');
const authMiddleware = require('../middlewares/auth_middleware');
// const fs = require('fs');
const multer = require('multer'); //form data 처리를 할수 있는 라이브러리 multer
const multerS3 = require('multer-s3'); // aws s3에 파일을 처리 할수 있는 라이브러리 multer-s3
const AWS = require('aws-sdk'); //javascript 용 aws 서비스 사용 라이브러리
const path = require('path'); //경로지정
AWS.config.update({
  //보안자격증명 액세스 키 설정해야 s3 bucket 접근이 가능하다.
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2', // 한국
});

const upload = multer({
  //upload라는 변수에 multer 생성
  storage: multerS3({
    //multer의 storage옵션을 multers3로 교체
    s3: new AWS.S3(),
    bucket: 'stravinestbucket', //bucket 이름
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    }, //저장할 파일명 설정 버킷 내부에서 oroginal 폴더 아래에 생성됨
    acl: 'public-read-write', //읽기 쓰기 접근가능
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, //최대 사이즈 5mb
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

//프론트 단에서 upload 한후 그 이미지 파일을 받아서 전달해주는 api
//'image'는 프론트에서 name 지정한 것과 일치해야함
//req.file.location => 객체 유알엘 들어가있음
router.post('/upload', upload.single('image'), function (req, res) {
  const originalUrl = req.file.location;
  console.log(req.body);
  const { title, content } = req.body;
  const resizeUrl = originalUrl.replace(/\/original\//, '/thumb/');
  console.log(title, content);
  console.log(originalUrl);
  res.json({ resizeUrl, originalUrl });
});

//게시글 등록 body 로 이미지 받는 방식
router.post(
  '/postImageUrl',
  // authMiddleware,
  async (req, res) => {
    try {
      //const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const userId = 'stravinest';
      const { title, content, image } = req.body; //formdata로 같이 넘어옴

      await Posts.create({ userId, title, content, image });

      res.status(200).send({ result: '게시글 작성에 성공하였습니다.' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(401).send({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
  }
);

//게시글 수정 body 로 이미지 받는 방식
router.put(
  '/modifyImageUrl/:postId',
  // authMiddleware,
  async (req, res) => {
    try {
      const s3 = new AWS.S3(); //s3 파일 삭제를 하기 위해 생성
      const postId = req.params.postId;
      //   const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const userId = 'stravinest';
      const { title, content, image } = req.body;
      const postInfo = await Posts.findOne({ where: { postId, userId } });
      //받은 userID와 postId  와 일치하는 게시글 찾기
      if (postInfo) {
        //게시글 있으면 아래실행
        console.log(postInfo.image);
        const beforeImage = postInfo.image.split('/')[4]; //이미지 주소 분리

        s3.deleteObject(
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
        s3.deleteObject(
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

        await Posts.update(
          {
            title: title,
            content: content,
            image: image, //이미지 새로 교체해서 넣어줌
          },
          {
            where: { postId: postId, userId: userId },
          }
        );
        res.send({ result: '게시글을 수정하였습니다.' });
      } else {
        //게시글 없으면 수정 실패
        res.status(401).send({ result: '게시글이 없거나 권한이 없습니다..' });
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

//게시글 등록 formdata 방식으로 받아오는 api
router.post(
  '/post',
  // authMiddleware,
  upload.single('image'), //upload(multer) api요청 주소로 formdata 형식으로 name 이 이미지로 1개 온것을 받는다.
  //formdata 안에 파일 말고 다른 정보는 body로 들어온다.
  async (req, res) => {
    try {
      //const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const userId = 'stravinest';
      const { title, content } = req.body; //formdata로 같이 넘어옴
      if (req.file) {
        //파일이 있으면 즉 image가 넘어오면
        const originalUrl = req.file.location; //s3 bucket이미지 주소가 들어있다. //프론트에서 쓸수 있음
        //람다 리사이징 과정
        //새로운 폴더를 만들어서 sharp 라이브러리를 이용해서 리사이징하는 코드를 짠다.
        //sharp 는 윈도우용 맥용 리눅스 용이 있는데 자동적으로 개발환경에 따라 깔린다.
        //우리가 사용할 람다는 리눅스용 이므로 배포환경 EC2 or lightsail에서 배포 해야 한다.
        //따라서 나의경우 EC2 ssh 에 접속해서 리사이징 코드를 받아온다 (받아오는 방법은 github를 이용)
        //git 에서 클론을 받고 npm i 까지 한후 압축 해서 aws-cli 를 이용해 업로드 한다.
        //업로드 후에 aws 사이트에서 람다메뉴에서 함수 생성을 하면 됨

        const resizeUrl = originalUrl.replace(/\/original\//, '/thumb/');
        //리사이즈 된 파일 주소 설정
        await Posts.create({ userId, title, content, image: originalUrl });

        //  res.status(200).send({ result: '게시글 작성에 성공하였습니다.' });
        res.json({ resizeUrl, originalUrl });
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
      const s3 = new AWS.S3(); //s3 파일 삭제를 하기 위해 생성
      const postId = req.params.postId;
      const { userId } = res.locals.user; //로그인 정보에서 가져온다.
      const { title, content } = req.body;
      if (req.file) {
        //이미지가 있을때 기존 이미지를 s3에서 삭제해야됨
        const postInfo = await Posts.findOne({ where: { postId, userId } });
        //받은 userID와 postId  와 일치하는 게시글 찾기
        if (postInfo) {
          //게시글 있으면 아래실행
          console.log(postInfo.image);
          const beforeImage = postInfo.image.split('/')[4]; //이미지 주소 분리

          s3.deleteObject(
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
          s3.deleteObject(
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
        } else {
          //게시글 없으면 수정 실패
          res.status(401).send({ result: '게시글 수정 실패 되었습니다.' });
        }
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
        } else {
          res
            .status(401)
            .send({ errorMessage: '이미지가 없고 해당게시글도 없습니다..' });
        }
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
router.patch('/delete/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    //  const { userId } = res.locals.user; //로그인 정보에서 가져온다.
    const userId = 'stravinest';
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
          where: { postId: postInfo.postId, userId: userId },
        }
      );
      // const postInfo2 = await Posts.findOne({ where: { postId, userId } });
      // console.log(postInfo2.postDelType);
      res.send({ result: '게시글을 삭제하였습니다.' });
    } else {
      res.status(401).send({
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

  console.log('--------res.locals.user 출력 테스트---------');
  try {
    // const postDetail = await Posts.findOne({ where: { postId, userId } });
    // //포스트아이디랑 userid 둘다 같아야 되서 내가 쓰지않은 글은 조회가 안됨
    const postDetail = await Posts.findOne({ where: { postId } });
    if (postDetail) {
      console.log('--------postDetail 출력 테스트---------');
      console.log({ postDetail });
      res.send({ result: postDetail });
    } else {
      res.status(401).send({
        errorMessage: '조회할수 있는 게시물이 없습니다.',
      });
    }
  } catch (error) {
    console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
    res.status(400).send({
      errorMessage: '게시물 상세조회에 실패 했습니다.',
    });
  }
});

module.exports = router;
