var express = require('express');
var path = require('path');
const fs = require('fs');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const webpush = require('web-push');


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

webpush.setVapidDetails(
  'mailto:supwjm@163.com',
  'BK_tayzPhTWTMxXeTHdoenICgqi1gitPXUXE-0iYql7LRzxEq_DhFtWQGL18gfmWLHyXdwDvXZePGtuHHIQ3fj4',
  'xMes2HexwO3BPLrRAec1D7gnc4kQjrBuw_KSNFO1YTQ'
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{maxage:'2h',lastModified:false,etag:false}));

app.use('/', index);
app.use('/users', users);


app.post('/sendMessage', function (req, res) {
  console.log(req.body.content)
  res.send({status:0,content:req.body.content});
});

// Register the user
app.post('/register', function (req, res) {

  console.log(req.body)
  //真实项目中需要把这个保存到数据库，以供后面使用
  var endpoint = req.body.endpoint;
  var authSecret = req.body.authSecret;
  var key = req.body.key;

  const pushSubscription = {
    endpoint: req.body.endpoint,
    keys: {
      auth: authSecret,
      p256dh: key
    }
  };

  if( ! fs.existsSync('pushSubscription.txt') ){
    fs.writeFileSync('pushSubscription.txt', JSON.stringify(pushSubscription));
  }

  res.send({status:0,mes:"订阅成功"});

  // var body = '谢谢关注';
  // var iconUrl = 'http://localhost:8087/images/huiju.png';
  //
  // webpush.sendNotification(pushSubscription,
  //   JSON.stringify({
  //     msg: body,
  //     url: 'http://localhost:8087',
  //     icon: iconUrl,
  //     type: 'register'
  //   }))
  //   .then(result => {
  //     console.log(result);
  //     res.sendStatus(201);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });

});

app.get('/notice', function (req, res) {
  let pushSubscription = JSON.parse(fs.readFileSync('pushSubscription.txt'));

  var body = '谢谢关注';
  var iconUrl = 'http://localhost:8087/images/huiju.png';

  webpush.sendNotification(pushSubscription,
    JSON.stringify({
      msg: body,
      url: 'http://localhost:8087',
      icon: iconUrl,
      type: 'register'
    }))
    .then(result => {
      console.log(result);
      res.send({status:0,mes:"发送成功"});
    })
    .catch(err => {
      console.log(3333333,err);
    });

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
