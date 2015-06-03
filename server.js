var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser'); 
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var moment = require('moment');
var app = express();

//设置配置信息
// app.set('config',config.development);
app.set('config',config.production);

//设置端口
// app.set('port', config.port);
//选择视图模版，并把后缀由.ejs转换为.html
app.set( 'views', 'ejs' );
app.set('view engine', 'ejs');
// app.set( 'view engine', 'html' );
// app.engine( '.html', require( 'ejs' ).__express );
//指定视图存放位置
app.set('views', require('path').join(__dirname, 'views'));
//指定静态资源存放位置
app.use(express.static(require('path').join(__dirname, 'public')));
//bodyParser()用于解析客户端请求
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//处理微信
app.use(express.query());
//文件保存
// app.use(multer({ 
//     dest: './uploads/',
//     rename: function (fieldname, filename) {
//         return moment().format('YYYYMMDDHHmmss');
//     }
// }));
//session
app.use(session({
    key:'session',
    secret:'secret',
    resave:true,
    saveUninitialized:false,
    // cookie:{
    //     maxAge:1000*60  //过期时间设置(单位毫秒)
    // },
    //改用mongodb做session持久化
    store:new MongoStore({
        url: app.get("config").sql_url
    })
}));

//加载配置信息
app.use(function(req,res,next){
    var n = [];
    var now = parseInt((new Date()).getFullYear());
    for(var i = (now - 3); i > 1970; i--){
      n.push(i);
    }
    app.locals.years = n;
    next();
});
app.locals.academys = config.academys;
app.locals.pemissions = config.pemissions;
app.locals.city = config.city;
app.set('email',config.email);

//routes 路由分发
require('./routes/routes')(app);

//启动服务
app.listen(app.get('config').port,function(){console.log("【"+moment().format('YYYY-MM-DD HH:mm:ss')+"】：服务器已启动，端口："+app.get('config').port);});
