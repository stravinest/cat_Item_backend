const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const routers = require('./routers'); // 통신을 수행하는 Router 생성
const cors = require('cors'); //cors!! 프론트에서 접근 할때 허용하기 위한 설정
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express'); //스웨거 자동생성을 위한 코드
const swaggerFile = require('./swagger_output.json'); //스웨거 아웃풋파일 저장 위치

const app = express();
const port = process.env.EXPRESS_PORT;

const corsOptions = {
  //cors설정
  // origin: "http://stravinest.shop",
  origin: '*', //전체 허용
  credentials: true,
};
app.use(cors(corsOptions)); //corsOptions으로 설정 전체 접근가능
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', routers); // 라우터 폴더 적용

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
//주소창 localhost:port/swagger 로 스웨거 편집기 실행
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

module.exports = app;
