const express = require('express');//노드 기초셋팅
const app = express();// 노드 기초셋팅
const bodyParser = require('body-parser');//node.js의 모듈로써 POST request data의 body로 부터 파라미터를 편리하게 추출
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
var cors = require("cors");
　

var indexRouter = require('./routes/main');

app.use(session({
    secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@', //쿠키를 임의로 변조하는것을 방지하기 위한 값, 이값을 통하여 세션을 암호화 하여 저장한다.
    resave: false, //세션을 언제나 저장할 지 정하는 값
    saveUninitialized: true // 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cors());
app.use(logger('dev'));
app.use(express.json()); //json을 사용할수있다.
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/',indexRouter);

　
app.use(bodyParser.urlencoded({extended: false}));

console.log('run node')
app.listen(3000);