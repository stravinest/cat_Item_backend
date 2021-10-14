const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const renders = require('./renders'); // 파일 등록 test
const routers = require('./routers'); // 통신을 수행하는 Router 생성
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

const app = express();
const port = process.env.EXPRESS_PORT;

const corsOptions = {
  //cors설정
  // origin: "http://stravinest.shop",
  origin: '*', //전체 허용
  credentials: true,
};
app.use(cors(corsOptions));
// 최 상단에서 request로 수신되는 Post 데이터가 정상적으로 수신되도록 설정한다.
// 주소 형식으로 데이터를 보내는 방식
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(express.static('./uploads')); // uploads에서 파일 참조 가능

// html을 대체하는 ejs 엔진을 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/api', routers); // 라우터 폴더 적용
app.use('/', renders); // test

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

module.exports = app;
