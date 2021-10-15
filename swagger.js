const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    version: '1.0.0',
    title: '8조 API',
    description: 'Description',
  },
  host: '3.34.255.91', //배포 하려고 하는 host에 맞춰줘야 동작함
  basePath: '/',
  schemes: ['http','https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      "name": "Login",
      "description": "로그인"
    },
    {
      "name": "User",
      "description": "회원가입"
    },
    {
      "name": "Post",
      "description": "게시판"
    },
    {
      "name": "reply",
      "description": "댓글"
    }
  ],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "send JWT",
    },
  },
  definitions: {
    Users: {
        "id": {
          "type": "Number"
        },
        "userId": {
          "type": "String"
        },
        "nickname": {
          "type": "String"
        },
        "userPw": {
          "type": "String"
        },
        "salt": {
          "type": "String"
        },
        "createdAt": {
          "type": "String"
        },
        "updatedAt": {
          "type": "String"
        }
      
    },
    Posts: {
        "postId": {
          "type": "Number"
        },
        "userId": {
          "type": "String"
        },
        "title": {
          "type": "String"
        },
        "content": {
          "type": "String"
        },
        "image": {
          "type": "String"
        },
        "postDelType": {
          "type": "String"
        },
        "createdAt": {
          "type": "String"
        },
        "updatedAt": {
          "type": "String"
        }
    
    },
    Replies: {
      
        "replyId": {
          "type": "Number"
        },
        "userId": {
          "type": "String"
        },
        "postId": {
          "type": "String"
        },
        "replyContent": {
          "type": "String"
        },
        "replyDelType": {
          "type": "String"
        },
        "createdAt": {
          "type": "String"
        },
        "updatedAt": {
          "type": "String"
        
      }
    }
  }
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.js'];
// const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc)
//swaggerAutogen으로 outputfile 파일을 app.js 루트로 api 들을 생성한다. 
//이때 명령어는 터미널에서 node swagger.js