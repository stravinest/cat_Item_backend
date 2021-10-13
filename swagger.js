const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    version: '1.0.0',
    title: '8조 API',
    description: 'Description',
  },
  host: 'localhost:3000',
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
      apiKeyAuth:{
          type: "apiKey",
          in: "header",       // can be "header", "query" or "cookie"
          name: "X-API-KEY",  // name of the header, query parameter or cookie
          description: "any description..."
      }
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