var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var multer = require('multer'); //이미지등록

var _storage = multer.diskStorage({ //이미지등록
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: _storage });

var db = { //디비 연결
  host: 'localhost',
  user: 'root',
  password: 'shoon0224',
  port: 3306,
  database: 'mydb',

}

var pool = mysql.createPool(db);

router.get('/', function (req, res, next) { //메인화면 요청 라우터
  var sess = req.session; //세션 요청
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");

    var sql = "select pid, pname, pprice, pimg from products";
    conn.query(sql, function (err, row) {
      conn.release();
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

router.get('/rating/:pid/:oid', function (req, res, next) {//평점화면
  var sess = req.session;
  var pid = req.params.pid;
  var oid = req.params.oid;

  res.render('index', { page: './rating', pid: pid, oid: oid, sess: sess })
});

router.get('/join', function (req, res, next) { // 회원가입화면
  var sess = req.session
  res.render('index', { page: './join', sess: sess })
});

router.get('/registCom', function (req, res, next) { // 컴퓨터 등록화면
  var sess = req.session
  res.render('index', { page: './registCom', sess: sess })
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
    var sql = "select pname, pprice, pkind, pexplan, pid, pimg, prate, ppoint from products where pid = ?"
    conn.query(sql, [pid], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      res.render('index', { page: './detail', data: row, sess: sess });
    });
  })
});

router.get('/review/:pid', function (req, res, next) { //뷰보기
  var sess = req.session;
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select rwid, comment from review where products_pid = ?"
    conn.query(sql, [pid], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      res.render('index', { page: './review', data: row, sess: sess });
    });
  })
});

router.get('/registReview/:pid', function (req, res, next) { //리뷰작성 화면보기
  var sess = req.session;
  var pid = req.params.pid;
      res.render('index', { page: './registReview', data:pid, sess: sess });
});



router.get('/delete/:pid', function (req, res, next) { //상품삭제 역할
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "delete from products where pid = ?";
    conn.query(sql, [pid], function (err, result) {
      conn.release();
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


router.get('/bdelete/:pid', function (req, res, next) { //장바구니 삭제 역할
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "delete from basket where products_pid = ?";
    conn.query(sql, [pid], function (err, result) {
      conn.release();
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






router.post('/comBuy/:pid', function (req, res, next) {// 주문하기 화면
  var sess = req.session;
  var pid = req.params.pid;
  var opamount = req.body.opamount;

  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select pid,pname,pprice,ppoint from products where pid = ?"
    conn.query(sql, [pid], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      res.render('index', { page: './order', data: row, sess: sess, opamount: opamount });
    });
  })
});





router.post('/order/:pid', function (req, res, next) { //주문하기
  var sess = req.session;
  var pid = req.params.pid;
  var opamount = req.body.opamount;

  pool.getConnection(function (err, conn) {
    if (err) {
      throw err;
    }
    var sql = 'insert into orders(oid, oday, oprice, oaddress, oname, ocard, otel, user_uid, user_cart) values(null, now(), ?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql, [req.body.oprice, req.body.oaddress, req.body.oname, req.body.otel, req.body.ocard, sess.info.uid, sess.info.cart, sess.info.upoint], function (err, row) {
      if (err) {
        throw err;
      }
      else {
        var sql = "SELECT LAST_INSERT_ID()";
        conn.query(sql, function (err, row) {
          if (err) {
            throw err;
          }
          if (row.length !== 0) {
            var sql = "insert into products_has_orders(orders_oid, products_pid, opamount) values( LAST_INSERT_ID(), ?, ?)";
            conn.query(sql, [pid, opamount], function (err, result) {
              if (err) {
                throw err;
              }
              if (result) {
                var sql = "select sum(oprice) as sum from orders where user_uid=?"
                conn.query(sql, [sess.info.uid], function (err, row) {
                  if (err) {
                    throw err;
                  }
                  if (row[0].sum >= 5000000 && row[0].sum < 10000000) {
                    var sql = "update user set urate = 'silver' where uid = ?"
                    conn.query(sql, [sess.info.uid], function (err, row) {
                      conn.release();
                      if (err) {
                        throw err;
                      }
                      if (result) {
                        sess.info = row[0];
                        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                        res.write("<script>alert('주문이 완료되었습니다.');location.href='/';</script>")
                      }
                    });
                  }
                  if (row[0].sum >= 10000000) {
                    var sql = "update user set urate = 'vip' where uid = ?"
                    conn.query(sql, [sess.info.uid], function (err, row) {
                      conn.release();
                      if (err) {
                        throw err;
                      }
                      
                      if (result) {
                        sess.info = row[0];
                        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                        res.write("<script>alert('주문이 완료되었습니다.');location.href='/';</script>")
                      }
                    })
                  }
                  
                  var sql = "select ppoint from product where = pid"
                  conn.query(sql, [sess.info.uid], function(err, row){
                    if(err){
                      throw err;
                    }
                    if (result) {
                      sess.info = row[0];
                      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                      res.write("<script>alert('주문이 완료되었습니다.');location.href='/';</script>")
                    }
                  })
                });
              }
              else {
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.write("<script>alert('주문을 실패했습니다.');history.back();</script>")
              }
            });
          }
        })
      }
    });
  })
});//받는 데이터}






router.get('/mypage', function (req, res, next) { //마이페이지 불러오기
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select orders.*, date_format(oday,'%y-%m-%d') AS ODAY, products.*, products_has_orders.* from orders, products, products_has_orders where orders.oid=products_has_orders.orders_oid and products_has_orders.products_pid=products.pid and orders.user_uid=?";
    conn.query(sql, [sess.info.uid], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.render('index', { page: './mypage', data: row, sess: sess });
    });
  })
});


router.post('/rating/:pid/:oid', function (req, res, next) { //평점주기
  var sess = req.session;
  var pid = req.params.pid;
  var oid = req.params.oid;

  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select porate from products_has_orders where orders_oid=? AND products_pid =?";
    conn.query(sql, [oid, pid], function (err, row) {
      if (err) {
        throw err;
      }
      if (row[0].porate == null) {
        var sql = "update products_has_orders set porate=? where products_pid=? AND orders_oid =?";
        conn.query(sql, [req.body.porate, pid, oid], function (err, row) {
          if (err) {
            throw err;
          }
          if (row) {
            var sql = "update products set prate = (SELECT AVG(porate) FROM products_has_orders where products_pid=?) where pid=?  "
            conn.query(sql, [pid, pid], function (err, row) {
              conn.release();
              if (err) {
                throw err;
              }
              if (row) {
                sess.info = row[0];
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.write("<script>alert('평점이 등록되었습니다.');location.href='/';</script>")
              }

            })
          }

        })
      }
      else {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('이미 평점을 등록하셨습니다.');history.back();</script>")
      }
    })
  })
})



router.post('/registReview/:pid', function (req, res, next) { //리뷰등록
  var sess = req.session;
  var pid = req.params.pid;

  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "insert into review values(null,?,?,?,?)";
    conn.query(sql, [req.body.comment,sess.info.uid,sess.info.cart, pid], function (err, row) {
      if (err) {
        throw err;
      }
      if (row) {
        sess.info = row[0];
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('리뷰가 등록되었습니다.');location.href='/';</script>")
      }
    })
  }
  )})







router.post('/refund/:oid', function (req, res, next) { //환불하기
  var sess = req.session;
  var oid = req.params.oid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");

    var sql = "insert into refund(orders_oid,orders_pid,orders_oday,orders_oprice,orders_oamount,user_uid) select orders.oid,products_has_orders.products_pid,orders.oday,orders.oprice,products_has_orders.opamount,orders.user_uid from orders,products_has_orders where orders.oid=? and products_has_orders.orders_oid=?";
    conn.query(sql, [oid, oid], function (err, result) {
      if (err) {
        throw err;
      }
      if (result) {
        var sql = "delete from products_has_orders where orders_oid= ?";
        conn.query(sql, [oid], function (err, result) {
          if (err) {
            throw err;
          }
          if (result) {
            if (result) {
              var sql = "delete from orders where oid=?";
              conn.query(sql, [oid], function (err, result) {
                conn.release();
                if (err) {
                  throw err;
                }
                if (result) {
                  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                  res.write("<script>alert('환불이 완료되었습니다.');location.href='/';</script>")
                }
              })
            }

          }
        })
      }
      else {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('환불을 실패했습니다.');history.back();</script>")
      }
    });
  })
});



router.get('/refund', function (req, res, next) { //환불내역
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select refund.*, products.* from refund,products where refund.orders_pid=products.pid and refund.user_uid=?"
    conn.query(sql, [sess.info.uid], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      if (row) {
        res.render('index', { page: './refund', data: row, sess: sess });
      }
    })
  }
  )
});




router.post('/basket/:pid', function (req, res, next) { //장바구니에 담기
  var sess = req.session;
  var pid = req.params.pid;
  var bamount = req.body.opamount

  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select * from basket where user_cart=? and user_uid =? and products_pid = ?";
    conn.query(sql, [sess.info.cart, sess.info.uid, pid], (err, row) => {
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        var sql = "insert into basket (user_cart, user_uid, products_pid, bamount) values(?,?,?,?)";
        conn.query(sql, [sess.info.cart, sess.info.uid, pid, bamount], function (err, result) {
          conn.release();
          if (err) {
            throw err;
          }
          if (result) {
            sess.info = row[0];
            res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            res.write("<script>alert('카트에 등록되었습니다.');location.href='/';</script>")
          }
          else {
            res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            res.write("<script>alert('카트에 등록되지 않았습니다.');history.back();</script>")
          }
        });
      }
      else {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.write("<script>alert('이미 카트에 담긴 상품입니다.');history.back();</script>")
      }
    });
  })
});//받는 데이터





router.get('/basket', function (req, res, next) {// 장바구니 불러오기
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");
    var sql = "select basket.*, products.* from basket, products where basket.products_pid=products.pid and basket.user_uid=? AND basket.user_cart=?";
    conn.query(sql, [sess.info.uid, sess.info.cart], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.render('index', { page: './basket', data: row, sess: sess });
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
        var sql = "insert into user values (?, ?, ?, ?,null,?,'bronze')";
        conn.query(sql, [req.body.uid, req.body.upw, req.body.uname, req.body.uaddress, req.body.master], function (err, row) {
          conn.release();
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


router.post('/inquire', function (req, res, next) { //검색
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "select pname, pkind, pprice, pexplan, pid, pimg from products where pname like concat('%', ?, '%') "
    conn.query(sql, [req.body.inquire], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      res.render('index', { page: './main', data: row, sess: sess })
    })
  })
})





router.post('/registCom', upload.single('photo'), function (req, res, next) {//컴퓨터 등록 SQL
  var sess = req.session;
  var imgurl = 'images/' + req.file.originalname;

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
        var sql = "insert into products(pid, pname, pprice, pkind, pexplan, pimg, ppoint) values (?, ?, ?, ?, ?, ?, ?)";
        conn.query(sql, [req.body.pid, req.body.pname, req.body.pprice, req.body.pkind, req.body.pexplan, imgurl, req.body.ppoint], function (err, result) {
          conn.release();
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





router.get('/modify/:pid', function (req, res, next) { //수정하기화면 불러오기
  var sess = req.session;
  var pid = req.params.pid;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    console.log("DB Connection");

    var sql = "select pname, pprice, pkind, pexplan, pid from products where pid=?";
    conn.query(sql, [pid], function (err, result) {
      conn.release();
      if (err) {
        throw err;
      }
      res.render('index', { page: './modify.ejs', data: result, sess: sess });
    });
  })
});


router.get('/border', function (req, res, next) { //장바구니 주문
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "select products.pname, products.pprice, basket.bamount from products,basket where basket.products_pid=products.pid and basket.user_uid=? AND basket.user_cart=? "
    conn.query(sql, [sess.info.uid, sess.info.cart], function (err, row) {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row)
      res.render('index', { page: './border.ejs', data: row, sess: sess });
    });
  })
});


router.post('/border', function (req, res, next) {// 장바구니 주문하기
  var sess = req.session;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = 'insert into orders(oid, oday, oprice, oaddress, oname, otel, ocard, user_uid, user_cart) values(null, now(), ?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql, [req.body.oprice, req.body.oaddress, req.body.oname, req.body.otel, req.body.ocard, sess.info.uid, sess.info.cart], function (err, row) {
      if (err) {
        throw err;
      }
      else {
        var sql = "SELECT LAST_INSERT_ID()";
        conn.query(sql, function (err, row) {
          if (err) {
            throw err;
          }
          if (row.length !== 0) {
            var sql = "insert into products_has_orders(products_pid, orders_oid,opamount) select basket.products_pid, LAST_INSERT_ID(), basket.bamount from basket where basket.user_uid=? AND basket.user_cart=?";
            conn.query(sql, [sess.info.uid, sess.info.cart], function (err, result) {
              if (err) {
                throw err;
              }
              if (result) {
                var sql = "delete from basket where user_uid=? and user_cart = ?";
                conn.query(sql, [sess.info.uid, sess.info.cart], function (err, result) {
                  conn.release();
                  if (err) {
                    throw err;
                  }
                  if (result) {
                    sess.info = row[0];
                    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                    res.write("<script>alert('주문이 완료되었습니다.');location.href='/';</script>")
                  } else {
                    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                    res.write("<script>alert('주문을 실패했습니다.');history.back();</script>")
                  }
                });
              }
            })
          }
        });
      }
    });
  })
});//받는 데이터


router.post('/modify/:pid', function (req, res, next) { //수정하기
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
      conn.release();
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




router.post('/logout', function (req, res, next) { //로그아웃
  var sess = req.session;
  sess.destroy();
  res.redirect('/'); // 로그아웃하면 메인화면으로 이동
});//로그아웃 요청
module.exports = router;