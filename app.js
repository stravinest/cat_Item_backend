const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
// const renders = require('./renders'); // 렌더 페이지
// const routers = require('./routers'); // 통신을 수행하는 Router 생성

const app = express();
const port = process.env.EXPRESS_PORT;

// 최 상단에서 request로 수신되는 Post 데이터가 정상적으로 수신되도록 설정한다.
// 주소 형식으로 데이터를 보내는 방식
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public')); // public에서 파일 참조 가능

const {sequelize} = require('./models');

sequelize.sync({ force: false })
  .then(() => {
    console.log('DB연결 성공');
  })
  .catch((err) => {
    console.error(err);
  })
// connect To DB
// const models = require('./models');
// models.sequelize.sync()
//   .then(() => {
//     console.log('✓ DB connection success.');
//     console.log('  Press CTRL-C to stop\n');
//   })
//   .catch(err => {
//     console.error(err);
//     console.log('✗ DB connection error. Please make sure DB is running.';
//     process.exit();
//   });

// html을 대체하는 ejs 엔진을 설정
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

// app.use('/api', routers); // 라우터 폴더 적용
// app.use('/', renders); //

const routers_register = require('./routers/router_register'); // 통신을 수행하는 Router 생성
app.use('/api', routers_register); // 라우터 폴더 적용

const routers_login = require('./routers/router_login'); // 통신을 수행하는 Router 생성
app.use('/api', routers_login); // 라우터 폴더 적용

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});


module.exports = app;