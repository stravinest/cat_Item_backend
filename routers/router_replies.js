const express = require('express');
const { Replies, sequelize, Sequelize } = require('../models');

// const authMiddleware = require('../middlewares/auth_middleware');

const router = express.Router();

//댓글 뿌리기
// router.get('/', async (req, res) => {
//   let result = [];
//   try {
//     const userId_join = `
//             SELECT p.postId, p.userId, p.title, p.content, p.image, u.nickname, p.createdAt, p.updatedAt
//             FROM Posts AS p
//             JOIN Users AS u
//             ON p.userId = u.userId
//             WHERE p.postDelType = 0
//             ORDER BY p.postId DESC`;

//     const posts = await sequelize.query(userId_join, {
//       type: Sequelize.QueryTypes.SELECT,
//     });

//     console.log({ posts });
//     res.send({ result: posts });
//   } catch (error) {
//     console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
//     res.status(400).send();
//   }
// });

//댓글 등록
router.post(
  '/post/:postId',
  //authMiddleware,
  async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = 'stravinest'; //로그인 정보에서 가져온다.
      const { replyContent } = req.body;

      await Replies.create({ userId, postId, replyContent });
      res.status(200).send({ result: '댓글 작성에 성공하였습니다.' });
    } catch (error) {
      console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
      res.status(400).send({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }
  }
);

// //게시글 수정
// router.put('/modify/:postId', upload.single('image'), async (req, res) => {
//   try {
//     const postId = req.params.postId;
//     const userId = 'stravinest'; //로그인 정보에서 가져온다.
//     const { title, content } = req.body;
//     const postInfo = await Posts.findOne({ where: { postId } });
//     console.log(postInfo.image);

//     if (req.file != undefined) {
//       fs.unlinkSync(`./uploads/${postInfo.image}`, (err) => {
//         console.log(err);
//         res.end(err);
//       }); //파일도 삭제해야댐
//       const image = req.file.filename;
//       await Posts.update(
//         {
//           title: title,
//           content: content,
//           image: image,
//         },
//         {
//           where: { postId: postId },
//         }
//       );
//     } else {
//       await Posts.update(
//         {
//           title: title,
//           content: content,
//         },
//         {
//           where: { postId: postId },
//         }
//       );
//     }

//     res.send({ result: '게시글을 수정하였습니다.' });
//   } catch (error) {
//     console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
//     res.status(400).send();
//   }
// });

// //게시글 삭제
// router.patch('/delete/:postId', async (req, res) => {
//   try {
//     console.log('여기');
//     const postId = req.params.postId;
//     const postInfo = await Posts.findOne({ where: { postId } });
//     console.log(postInfo.image);
//     fs.unlinkSync(`./uploads/${postInfo.image}`, (err) => {
//       //동기로 처리안하면 에러나는데 .. 흠 어떻게 해야할까?

//       console.log(err);
//       res.end(err);
//     }); //파일도 삭제해야댐
//     console.log('삭제?');
//     await Posts.update(
//       {
//         postDelType: 1,
//       },
//       {
//         where: { postId: postId },
//       }
//     );
//     res.send({ result: '게시글을 삭제하였습니다.' });
//   } catch (error) {
//     console.log(`${req.method} ${req.originalUrl} : ${error.message}`);
//     res.status(400).send();
//   }
// });

module.exports = router;
