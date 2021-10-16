# cat_Item_backend
🐱‍👓고양이용품 추천 사이트 백앤드
<h2>사이트설명</h2>
동거동락하는 소중한 고양이 
집사들만의 노하우가 담긴 팁들이나 용품들을 소개 해 보아요 

<h2>제작기간 팀원소개</h2>
<li> 2021 10월11일 ~ 2021 10월 16일</li>
<li>5인 1조 팀프로젝트<br>
 front-end:
 박상수, 박주승, 류은설 <br>
 back-end:
 양주혁, 전은규
  
<h2>사용기술</h2>
<li>Node.js</li>
<li>Express</li>
<li>MYSQL</li>

<h2>라이브러리</h2>

|제목|설명|
|:------:|:---:|
|cors|교차 리소스 공유|
|dotenv|DB비밀번호, 시크릿키 암호화|
|jsonwebtoken|회원가입 작동 방식|
|sequelize|MySQL ORM|
|mysql|MySQL|
|cookie-parser|쿠키 저장|
|multer|파일처리|
|multer-s3|s3에 파일저장|
|aws-sdk|자바스크립트용 aws서비스사용|
|crypto|비밀번호 해쉬화|
|swagger-autogen|스웨거 자동생성|
|sharp|이미지 리사이징|
  
<h2>deploy</h2>
<li>AWS EC2
<li>AWS s3
<li>AWS lambda
 <br>
<h2>실행화면링크</h2>


<h2>API설계</h2>
  
[API스프레드시트](https://docs.google.com/spreadsheets/d/1GvhNR2HwSWzPTe2v8AqtW1i7GKxYRQVDAgfor6uLf0o/edit#gid=0)
  
[API스웨거](http://stravinest.shop/swagger/)
 
[API스웨거사용법](https://velog.io/@stravinest/swagger-%EC%82%AC%EC%9A%A9%EB%B2%95%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%9C%A0%EC%A7%80)

<h2>문제 해결</h2>
 <h3>1.swagger의 문제</h3>
 처음 계획했던 시나리오는 swagger로 api를 명세하면서 기능을 구현하는 것이 었다. <br>
 하지만 swagger를 swaggerhub에서 yaml 으로 하나하나씩 하드코딩하면서 api를 짜는 것이 상당한 시간이 걸렸다.<br>
 그래서 결국엔 swagger를 접어두고서는 스프레드 공유 시트로 api 명세를 했다.<br>
 후에 swagger자동생성을 알게 되어서 라이브러리로 간단하게 swagger편집기를 만들수 있었다.<br>
 <h3>2.swagger 로그인의 문제</h3>
 우리는 로그인 기능을 jwt토큰을 클라이언트에게 쿠키로 전달 하는 방식을 사용했다.<br>
 하지만 swgger는 편집기에서 쿠키를 지원하지 않는다는 것을 알았다. <br>
 따라서 막상 로그인 후에 기능을 테스팅 할수가 없었다.<br>
 후에 결국 로그인 인증 방식을 header 로부터 전달하는 Bearer 방식을 사용했다. <br>
 이방식을 사용하면 swagger편집기에서도 토큰값을 Autherize에 입력해 로그인후 동작을 테스트 할 수 있었다.<br>
 <h3>3.이미지파일 저장 방식 </h3>
 처음 우리는 사진파일을 받아서 서버에 저장하는 방식을 택했다.<br>
그러나 서버에 이미지파일이 계속 생성되면 서버에 안좋을 거라 생각하고 s3에 저장하는 방식으로 바꿨다.<br>
s3에 저장시에 람다 트리거를 사용해서 이미지 사이즈를 200*200으로 설정해서 바꿨다.<br>
 <h3>4.구현하기 어려웠던 lambda 트리거의 작동 방식 </h3>
 람다 리사이징 과정<br>
        새로운 폴더를 만들어서 sharp 라이브러리를 이용해서 리사이징하는 코드를 짠다.<br>
        sharp 는 윈도우용 맥용 리눅스 용이 있는데 자동적으로 개발환경에 따라 깔린다.<br>
        우리가 사용할 람다는 리눅스용 이므로 배포환경 EC2 or lightsail에서 빌드 해야 한다.<br>
        따라서 나의경우 EC2 ssh 에 접속해서 리사이징 코드를 받아온다 (받아오는 방법은 github를 이용)<br>
        git 에서 클론을 받고 npm i 까지 한후 압축 해서 aws-cli 를 이용해 업로드 한다.<br>
        업로드 후에 aws 사이트에서 람다메뉴에서 함수 생성을 하면 된다.<br>
 
 <h3>4.프론트와의 이미지파일 저장 방식 소통에서의 부재 </h3>
 멘토님에게 중간 피드백을 받고서는 내가 이해한 방식으로는 프론트에서 파일데이터를 넘겨주면 백에서 s3저장하고 리사이징해서 그 주소를 프론트에게 넘겨준다. 이렇게 이해를 했다.<br>
 하지만 프론트에서는 따로 이미지파일을 저장하고 URL을 받아오는 API를 요청했고 API를 통해 가져온 이미지URL만 백으로 넘겨주는 방식을 원했다. <br>
 이런설계 하기 전에 미리 어떤 방식으로 이미지 파일을 저장하고 가져올지를 협의 했으면 더 좋지 않았을까 싶었다.
 





