const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const renders = require('./renders'); // 파일 등록 test
const routers = require('./routers'); // 통신을 수행하는 Router 생성
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = {
  //origin 배포 후 S3 local 주소로 수정하면 될 듯
  origin: "http://localhost:3000",
  credentials: true
}

const app = express();
const port = process.env.EXPRESS_PORT;

// 최 상단에서 request로 수신되는 Post 데이터가 정상적으로 수신되도록 설정한다.
// 주소 형식으로 데이터를 보내는 방식
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(express.static('./uploads')); // public에서 파일 참조 가능
app.use(cors(corsOptions));

// //주혁님
// const routers_register = require('./routers/router_register'); // 통신을 수행하는 Router 생성
// app.use('/api', routers_register); // 라우터 폴더 적용

// const routers_login = require('./routers/router_login'); // 통신을 수행하는 Router 생성
// app.use('/api', routers_login); // 라우터 폴더 적용

// html을 대체하는 ejs 엔진을 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/api', routers); // 라우터 폴더 적용
app.use('/', renders); // test

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

module.exports = app;
