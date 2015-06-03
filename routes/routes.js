/*
 * 路由分发
 */

//依赖
var moment = require('moment');
var mongoose = require('mongoose');

//路由
var page = require('./page');
var hasLogin = require('./hasLogin');
var notLogin = require('./notLogin');
var error = require('./error');
var wechat = require('./wechat');

module.exports = function(app){
	//判断访问终端
	app.use('*', function(req, res, next){
	    var deviceAgent = req.headers["user-agent"].toLowerCase();
		var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
		if(agentID){
			app.set('terminal','mobile_');
		}else{
			app.set('terminal','');
		}
		next();
	});

	//连接数据库
	mongoose.connect(app.get('config').sql_url);
	// mongoose.connect(app.get('config').sql_url, {server: {auto_reconnect:true}});
	// mongoose.connection.on('close', function(){
	// 	mongoose.connect(app.get('config').sql_url, {server:{auto_reconnect:true}});
	// 	console.log('【mongodb has reconnection】');
	// });
	// mongoose.connection.on('error', function(error){
	// 	console.log('【mongodb connections is error】 + ' + error);
	// 	mongoose.disconnect();
	// });
	
	//微信路由
	wechat.routes(app);
	//页面渲染路由
	page.routes(app);
	//免登录逻辑处理路由
	notLogin.routes(app);
	//登录过滤、逻辑处理路由
	hasLogin.routes(app);
	//错误处理路由
	error.routes(app);
}