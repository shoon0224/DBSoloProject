var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var db = { //디비 연결
  host: 'localhost',
  user: 'root',
  password: 'shoon0224',
  port: 3306,
  database: 'mydb'
}
var pool = mysql.createPool(db);

router.get('/', function (req, res, next) { //메인화면 요청 라우터
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");

    var sql = "select pid, pname, pprice from products";
    conn.query(sql, function (err, row) {
      if (err) {
        throw err;
      }
      res.render('index', { page: './main', data: row, sess: sess });
    });
  })
});

router.get('/login', function (req, res, next) {//로그인화면
  var sess = req.session;
  res.render('index', { page: './login', sess: sess })
});

router.get('/join', function (req, res, next) { // 회원가입화면
  var sess = req.session
  res.render('index', { page: './join', sess: sess })
});

router.get('/registCom', function (req, res, next) { // 컴퓨터 등록화면
  var sess = req.session
  res.render('index', { page: './registCom', sess: sess })
});

router.get('/mypage/:uid', function (req, res, next) { // 마이페이지
  var sess = req.session
  res.render('index', { page: './mypage', sess: sess })
});

router.get('/basket/:uid', function (req, res, next) { // 장바구니
  var sess = req.session
  res.render('index', { page: './basket', sess: sess })
});

router.get('/detail/:pid', function (req, res, next) { //상품 상세보기
  var sess = req.session;
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select pname, pprice, pkind, pexplan, pid from products where pid = ?"
    conn.query(sql, [pid], function (err, row) {
      if (err) {
        throw err;
      }
      res.render('index', { page: './detail', data: row, sess: sess });
    });
  })
});

router.get('/delete/:pid', function (req, res, next) { //삭제 역할
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "delete from products where pid = ?";
    conn.query(sql, [pid], function (err, result) {
      if (err) {
        throw err;
      }
      if (result) {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('삭제가 완료되었습니다.');location.href='/';</script>")
      }
      else {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('삭제가 되지 않았습니다.');history.back();</script>")
      }
    });
  })
});

router.post('/join', function (req, res, next) {//회원가입 SQL
  var sess = req.session;
  pool.getConnection(function (err, conn) {
    if (err) {
      throw err;
    }
    var sql = "select * from user where uid=?";
    conn.query(sql, [req.body.uid], (err, row) => {
      if (err) {
        throw err;

      }
      if (row.length === 0) {
        var sql = "insert into user values (?, ?, ?, ?,null,?)";
        conn.query(sql, [req.body.uid, req.body.upw, req.body.uname, req.body.uaddress, req.body.master], function (err, row) {
          if (err) {
            throw err;
          }
          res.render("index", { page: './login', sess: sess }); // 회원가입 완료후 로그인 화면으로 이동
        });
      }
      else {
        res.send("<script>alert('중복된 아이디입니다.');history.back();</script>"); // 아이디가 중복된 아이디로 가입시도시 알럿 표시
      }
    });//회원가입 요청
  })
});


router.post('/registCom', function (req, res, next) {//컴퓨터 등록 SQL
  var sess = req.session;
  pool.getConnection(function (err, conn) {
    if (err) {
      throw err;
    }
    var sql = "select * from products where pid=?";
    conn.query(sql, [req.body.pid], (err, row) => {
      if (err) {
        throw err;
      }
      else if (row.length === 0) {
        var sql = "insert into products(pid, pname, pprice, pkind, pexplan) values (?, ?, ?, ?, ?)";
        conn.query(sql, [req.body.pid, req.body.pname, req.body.pprice, req.body.pkind, req.body.pexplan], function (err, result) {
          if (err) {
            res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            res.write("<script>alert('상품 등록이 완료되지 않았습니다.');history.back();</script>")
          }
          if (result) {
            sess.info = row[0];//이거 없으면 데이터 안들어감
            res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            res.write("<script>alert('상품이 등록되었습니다.');location.href='/';</script>")
          }
        });
      }
      else {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('중복된 모델번호입니다.');history.back();</script>")
      }
    });//상품 등록 요청
  })
});

router.get('/modify/:pid', function (req, res, next) {
  var sess = req.session;
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");

    var sql = "select pname, pprice, pkind, pexplan, pid from products where pid=?";
    conn.query(sql, [pid], function (err, result) {
      if (err) {
        throw err;
      }
      res.render('index', { page: './modify.ejs', data: result, sess: sess });
    });
  })
});

router.post('/modify/:pid', function (req, res, next) {
  var sess = req.session;
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");

    var sql = "update products set pid = ?, pname = ?, pprice = ?, pkind = ?, pexplan = ? where pid = ?";
    conn.query(sql, [req.body.pid, req.body.pname, req.body.pprice, req.body.pkind, req.body.pexplan, pid], function (err, result) {
      conn.release();
      if (err) {
        throw err;
      }
      if (result) {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('게시물이 수정되었습니다.');location.href='/';</script>")
      }
      else {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('게시물 수정이 완료되지 않았습니다.');history.back();</script>")
      }
    });
  })
});//받는 데이터

router.post('/login', function (req, res, next) { //로그인정보 포스트
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "select * From user where uid = ? AND upw = ? AND master = ?"; //아이디 비밀번호 관리사용자 검색
    conn.query(sql, [req.body.uid, req.body.upw, req.body.master], (err, row) => {
      if (err) {
        res.send(300, {
          result: 0,
          msg: 'DB Error'
        });
      }
      else if (req.body.master != 0 && req.body.master != 1) { // 관리자 사용자 체크를 안해주었을 경우
        res.send(`<script> alert('사용자 체크를 해주세요.');  history.back(); </script>`); // history.back은 로그인 실패하면 뒤로감
      }
      else if (row.length === 0) {
        res.send(`<script> alert('없는 계정입니다.');  history.back(); </script>`); // history.back은 로그인 실패하면 뒤로감
      }
      else {
        sess.info = row[0]; // 세션에 로그인 된 정보들을 저장한다.
        res.redirect('/'); //그리고 메인화면으로 간다.
      }
    });
  })
});//로그인 요청

router.post('/logout', function (req, res, next) {
  var sess = req.session;
  sess.destroy();
  res.redirect('/'); // 로그아웃하면 메인화면으로 이동
});//로그아웃 요청
module.exports = router;